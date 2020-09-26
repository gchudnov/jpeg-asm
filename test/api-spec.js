'use strict';

var Module = require('../build/libjpegasm');
var Runtime = Module['Runtime'];

var api = require('../lib/api');
var should = require('should');
var fs = require('fs');

var SIZE_OF_POINTER = 4;

describe('JpegAsm', function () {

  var rgbWidth = 32;
  var rgbHeight = 32;
  var rgbArray = new ArrayBuffer(rgbWidth * rgbHeight * 3);

  function initRgbImage() {
    var view = new Uint8Array(rgbArray);
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

  function saveFile(arr, filename) {
    var outDir = __dirname + '/out/';
    if(!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
    fs.writeFileSync(outDir + filename, Buffer.from(arr));
  }

  before(function () {
    initRgbImage();
  });

  describe('Low-Level API', function() {

    // wrap functions
    var encode_jpeg = Module.cwrap('encode_jpeg', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
    var decode_jpeg = Module.cwrap('decode_jpeg', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);

    it('encodes JPEG', function () {
      var stack = Runtime.stackSave();

      var quality = 80;

      var rgbBufferPtr = Module._malloc(rgbArray.byteLength);
      Module.HEAPU8.set(new Uint8Array(rgbArray), rgbBufferPtr);

      var outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outBufferSizePtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

      Module.setValue(outBufferPtrPtr, 0, 'i32');
      Module.setValue(outBufferSizePtr, 0, 'i32');
      Module.setValue(outMsgPtrPtr, 0, 'i32');

      // invoke
      var result = encode_jpeg(rgbBufferPtr, rgbWidth, rgbHeight, quality, outBufferPtrPtr, outBufferSizePtr, outMsgPtrPtr);

      var outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
      var outBufferSize = Module.getValue(outBufferSizePtr, 'i32');
      var outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');
      var outMsg = Module.Pointer_stringify(outMsgPtr);

      var jpegBuffer = new Uint8Array(Module.HEAPU8.buffer, outBufferPtr, outBufferSize);
      saveFile(jpegBuffer, 'encoded-by-js.jpeg');

      result.should.be.equal(0);
      outBufferPtr.should.be.greaterThan(0);
      outBufferSize.should.be.greaterThan(0);
      outMsg.length.should.be.equal(0);

      Module._free(rgbBufferPtr);
      Module._free(outBufferPtr);
      Module._free(outMsgPtr);

      Runtime.stackRestore(stack);
    });

    it('decodes JPEG', function () {
      var stack = Runtime.stackSave();

      var jpegBuffer = fs.readFileSync(__dirname + '/data/sample.jpg');

      var jpegBufferPtr = Module._malloc(jpegBuffer.length);
      var dataHeap = new Uint8Array(Module.HEAPU8.buffer, jpegBufferPtr, jpegBuffer.length);
      for(var i = 0; i != jpegBuffer.length; ++i) {
        dataHeap[i] = jpegBuffer[i];
      }

      var outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outBufferWidthPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outBufferHeightPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

      Module.setValue(outBufferPtrPtr, 0, 'i32');
      Module.setValue(outBufferWidthPtr, 0, 'i32');
      Module.setValue(outBufferHeightPtr, 0, 'i32');
      Module.setValue(outMsgPtrPtr, 0, 'i32');

      // invoke
      var result = decode_jpeg(jpegBufferPtr, jpegBuffer.length, outBufferPtrPtr, outBufferWidthPtr, outBufferHeightPtr, outMsgPtrPtr);

      var outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
      var outBufferWidth = Module.getValue(outBufferWidthPtr, 'i32');
      var outBufferHeight = Module.getValue(outBufferHeightPtr, 'i32');
      var outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');
      var outMsg = Module.Pointer_stringify(outMsgPtr);

      result.should.be.equal(0);
      outBufferPtr.should.be.greaterThan(0);
      outBufferWidth.should.be.equal(32);
      outBufferHeight.should.be.equal(32);
      outMsg.length.should.be.equal(0);

      Module._free(jpegBufferPtr);
      Module._free(outBufferPtr);
      Module._free(outMsgPtr);

      Runtime.stackRestore(stack);
    });

    it('cannot encode an image with invalid dimensions', function () {
      var stack = Runtime.stackSave();

      var quality = 80;

      var rgbBufferPtr = Module._malloc(rgbArray.byteLength);
      Module.HEAPU8.set(new Uint8Array(rgbArray), rgbBufferPtr);

      var outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outBufferSizePtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

      Module.setValue(outBufferPtrPtr, 0, 'i32');
      Module.setValue(outBufferSizePtr, 0, 'i32');
      Module.setValue(outMsgPtrPtr, 0, 'i32');

      // invoke
      var result = encode_jpeg(rgbBufferPtr, 0, 0, quality, outBufferPtrPtr, outBufferSizePtr, outMsgPtrPtr);

      var outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
      var outBufferSize = Module.getValue(outBufferSizePtr, 'i32');
      var outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');
      var outMsg = Module.Pointer_stringify(outMsgPtr);

      result.should.be.equal(33);
      outBufferPtr.should.be.equal(0);
      outBufferSize.should.be.equal(0);
      outMsg.should.be.equal('Empty JPEG image (DNL not supported)');

      Module._free(rgbBufferPtr);
      Module._free(outBufferPtr);
      Module._free(outMsgPtr);

      Runtime.stackRestore(stack);
    });

    it('cannot decode a corrupted JPEG', function () {
      var stack = Runtime.stackSave();

      var jpegArrayBuffer = new ArrayBuffer(4);
      var jpegView = new Uint8Array(jpegArrayBuffer);
      jpegView[0] = 0xAA;
      jpegView[1] = 0xBB;
      jpegView[2] = 0xCC;
      jpegView[3] = 0xDD;

      var jpegBufferPtr = Module._malloc(jpegArrayBuffer.byteLength);
      Module.HEAPU8.set(jpegView, jpegBufferPtr);

      var outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outBufferWidthPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outBufferHeightPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      var outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

      Module.setValue(outBufferPtrPtr, 0, 'i32');
      Module.setValue(outBufferWidthPtr, 0, 'i32');
      Module.setValue(outBufferHeightPtr, 0, 'i32');
      Module.setValue(outMsgPtrPtr, 0, 'i32');

      // invoke
      var result = decode_jpeg(jpegBufferPtr, jpegArrayBuffer.byteLength, outBufferPtrPtr, outBufferWidthPtr, outBufferHeightPtr, outMsgPtrPtr);

      var outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
      var outBufferWidth = Module.getValue(outBufferWidthPtr, 'i32');
      var outBufferHeight = Module.getValue(outBufferHeightPtr, 'i32');
      var outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');
      var outMsg = Module.Pointer_stringify(outMsgPtr);

      result.should.be.equal(55);
      outBufferPtr.should.be.equal(0);
      outBufferWidth.should.be.equal(0);
      outBufferHeight.should.be.equal(0);
      outMsg.should.be.equal('Not a JPEG file: starts with 0xaa 0xbb');

      Module._free(jpegBufferPtr);
      Module._free(outBufferPtr);
      Module._free(outMsgPtr);

      Runtime.stackRestore(stack);
    });

  });

  describe('High-Level API', function() {

    it('encodes JPEG', function() {
      var quality = 80;

      var encoded = api.encode(rgbArray, rgbWidth, rgbHeight, quality);

      encoded.byteLength.should.be.greaterThan(0);
    });

    it('decodes JPEG', function() {
      var jpegBuffer = fs.readFileSync(__dirname + '/data/sample.jpg');
      var jpegArray = new ArrayBuffer(jpegBuffer.length);
      var jpegView = new Uint8Array(jpegArray);
      for(var i = 0; i != jpegBuffer.length; ++i) {
        jpegView[i] = jpegBuffer[i];
      }

      var decodedObj = api.decode(jpegArray);

      decodedObj.buffer.byteLength.should.be.greaterThan(0);
      decodedObj.width.should.be.equal(32);
      decodedObj.height.should.be.equal(32);
    });

    it('cannot encode an image with invalid dimensions', function() {
      (function(){
        var quality = 80;

        api.encode(rgbArray, 0, 0, quality);

      }).should.throw();
    });

    it('cannot decode a corrupted JPEG', function() {
      (function(){
        var jpegArrayBuffer = new ArrayBuffer(4);
        var jpegView = new Uint8Array(jpegArrayBuffer);
        jpegView[0] = 0xAA;
        jpegView[1] = 0xBB;
        jpegView[2] = 0xCC;
        jpegView[3] = 0xDD;

        api.decode(jpegArrayBuffer);

      }).should.throw();
    });

  });
});
