'use strict';

var should = require('should');
var Module = require('./../build/jpegasm');
var fs = require('fs');

describe('JpegAsm', function () {

  var rgbWidth = 32;
  var rgbHeight = 32;
  var rgbBuffer = new ArrayBuffer(rgbWidth * rgbHeight * 3);

  function initRgbImage() {
    var view = new Uint8Array(rgbBuffer);
    var index;
    for (var y = 0; y != rgbHeight; ++y) {
      for (var x = 0; x != rgbWidth * 3; x += 3) {
        index = y * rgbWidth * 3 + x;
        view[index + 0] = 0x00; // R
        view[index + 1] = 0x00; // G
        view[index + 2] = 0xFF; // B
      }
    }
  }

  before(function () {
    initRgbImage();
  });

  // wrap functions
  var encodeJpeg = Module.cwrap('encode_jpeg', undefined, ['number', 'number', 'number', 'number', 'number', 'number']);
  var decodeJpeg = Module.cwrap('decode_jpeg', undefined, ['number', 'number', 'number', 'number', 'number']);


  it('encodes JPEG', function () {
    var quality = 80;

    var nDataBytes = rgbBuffer.byteLength;
    var dataPtr = Module._malloc(nDataBytes);
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(rgbBuffer));

    var jpegBufferPtrPtr = Module._malloc(Uint32Array.BYTES_PER_ELEMENT);
    var jpegBufferSizePtr = Module._malloc(Uint32Array.BYTES_PER_ELEMENT * 2);

    encodeJpeg(dataPtr, rgbWidth, rgbHeight, quality, jpegBufferPtrPtr, jpegBufferSizePtr);

    var jpegBufferSize = Module.getValue(jpegBufferSizePtr, 'i64');
    var jpegBufferPtr = Module.getValue(jpegBufferPtrPtr, 'i32');

    var jpegBuffer = new Uint8Array(Module.HEAPU8.buffer, jpegBufferPtr, jpegBufferSize);

    fs.mkdirSync(__dirname + '/out/');
    fs.writeFileSync(__dirname + '/out/encoded-by-js.jpeg', new Buffer(jpegBuffer));

    Module._free(dataPtr);
    Module._free(jpegBufferPtrPtr);
    Module._free(jpegBufferSizePtr);

    jpegBufferSize.should.be.greaterThan(0);
    jpegBufferPtr.should.be.greaterThan(0);
  });

  it('decodes JPEG', function () {

    var jpegBuffer = fs.readFileSync(__dirname + '/data/sample.jpg');

    var nDataBytes = jpegBuffer.length;
    var dataPtr = Module._malloc(nDataBytes);
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    for(var i = 0; i != nDataBytes; ++i) {
      dataHeap[i] = jpegBuffer[i];
    }

    var outBufferPtrPtr = Module._malloc(Uint32Array.BYTES_PER_ELEMENT);
    var outBufferWidthPtr = Module._malloc(Uint32Array.BYTES_PER_ELEMENT);
    var outBufferHeightPtr = Module._malloc(Uint32Array.BYTES_PER_ELEMENT);

    decodeJpeg(dataPtr, nDataBytes, outBufferPtrPtr, outBufferWidthPtr, outBufferHeightPtr);

    var outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
    var outBufferWidth = Module.getValue(outBufferWidthPtr, 'i32');
    var outBufferHeight = Module.getValue(outBufferHeightPtr, 'i32');

    outBufferPtr.should.be.greaterThan(0);
    outBufferWidth.should.be.equal(32);
    outBufferHeight.should.be.equal(32);

    //var rgbHeap = new Uint8Array(Module.HEAPU8.buffer, outBufferPtr, outBufferWidth * outBufferHeight * 3);

    Module._free(dataPtr);
    Module._free(outBufferPtrPtr);
    Module._free(outBufferWidthPtr);
    Module._free(outBufferHeightPtr);
  });
});

/*
 var buf = Module._malloc(myTypedArray.length*myTypedArray.BYTES_PER_ELEMENT);
 Module.HEAPU8.set(myTypedArray, buf);
 Module.ccall('my_function', 'number', ['number'], [buf]);
 Module._free(buf);
 */