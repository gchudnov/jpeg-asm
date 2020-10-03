'use strict';

// low-level API
const Module = require('../build/libjpegasm');
const Runtime = Module;

// high-level API
const api = require('../src/bridge/index');
const {initRgbImage} = require('./util/image');

const should = require('should');
const fs = require('fs');

const SIZE_OF_POINTER = 4;

describe('JpegAsm', () => {

  function saveFile(arr, filename) {
    const outDir = __dirname + '/out/';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }
    fs.writeFileSync(outDir + filename, Buffer.from(arr));
  }

  describe('Low-Level API', () => {

    // wrap functions
    const encode_jpeg = Module.cwrap('encode_jpeg', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
    const decode_jpeg = Module.cwrap('decode_jpeg', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);

    it('encodes JPEG', () => {
      const stack = Runtime.stackSave();

      const quality = 80;
      const imageWidth = 32;
      const imageHeight = 32;
      const imageArray = initRgbImage(imageWidth, imageHeight);

      const rgbBufferPtr = Module._malloc(imageArray.length);
      Module.HEAPU8.set(imageArray, rgbBufferPtr);

      const outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outBufferSizePtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

      Module.setValue(outBufferPtrPtr, 0, 'i32');
      Module.setValue(outBufferSizePtr, 0, 'i32');
      Module.setValue(outMsgPtrPtr, 0, 'i32');

      // invoke
      const result = encode_jpeg(rgbBufferPtr, imageWidth, imageHeight, quality, outBufferPtrPtr, outBufferSizePtr, outMsgPtrPtr);

      const outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
      const outBufferSize = Module.getValue(outBufferSizePtr, 'i32');
      const outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');
      const outMsg = Module.UTF8ToString(outMsgPtr);

      const jpegBuffer = new Uint8Array(Module.HEAPU8.buffer, outBufferPtr, outBufferSize);
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

    it('decodes JPEG', () => {
      const stack = Runtime.stackSave();

      const jpegBuffer = fs.readFileSync(__dirname + '/data/sample.jpg');

      const jpegBufferPtr = Module._malloc(jpegBuffer.length);
      const dataHeap = new Uint8Array(Module.HEAPU8.buffer, jpegBufferPtr, jpegBuffer.length);
      for (let i = 0; i !== jpegBuffer.length; ++i) {
        dataHeap[i] = jpegBuffer[i];
      }

      const outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outBufferWidthPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outBufferHeightPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

      Module.setValue(outBufferPtrPtr, 0, 'i32');
      Module.setValue(outBufferWidthPtr, 0, 'i32');
      Module.setValue(outBufferHeightPtr, 0, 'i32');
      Module.setValue(outMsgPtrPtr, 0, 'i32');

      // invoke
      const result = decode_jpeg(jpegBufferPtr, jpegBuffer.length, outBufferPtrPtr, outBufferWidthPtr, outBufferHeightPtr, outMsgPtrPtr);

      const outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
      const outBufferWidth = Module.getValue(outBufferWidthPtr, 'i32');
      const outBufferHeight = Module.getValue(outBufferHeightPtr, 'i32');
      const outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');
      const outMsg = Module.UTF8ToString(outMsgPtr);

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

    it('cannot encode an image with invalid dimensions', () => {
      const stack = Runtime.stackSave();

      const quality = 80;
      const imageArray = initRgbImage(32, 32)

      const rgbBufferPtr = Module._malloc(imageArray.length);
      Module.HEAPU8.set(imageArray, rgbBufferPtr);

      const outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outBufferSizePtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

      Module.setValue(outBufferPtrPtr, 0, 'i32');
      Module.setValue(outBufferSizePtr, 0, 'i32');
      Module.setValue(outMsgPtrPtr, 0, 'i32');

      // invoke
      const result = encode_jpeg(rgbBufferPtr, 0, 0, quality, outBufferPtrPtr, outBufferSizePtr, outMsgPtrPtr);

      const outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
      const outBufferSize = Module.getValue(outBufferSizePtr, 'i32');
      const outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');
      const outMsg = Module.UTF8ToString(outMsgPtr);

      result.should.be.equal(33);
      outBufferPtr.should.be.equal(0);
      outBufferSize.should.be.equal(0);
      outMsg.should.be.equal('Empty JPEG image (DNL not supported)');

      Module._free(rgbBufferPtr);
      Module._free(outBufferPtr);
      Module._free(outMsgPtr);

      Runtime.stackRestore(stack);
    });

    it('cannot decode a corrupted JPEG', () => {
      const stack = Runtime.stackSave();

      const jpegArrayBuffer = new ArrayBuffer(4);
      const jpegView = new Uint8Array(jpegArrayBuffer);
      jpegView[0] = 0xAA;
      jpegView[1] = 0xBB;
      jpegView[2] = 0xCC;
      jpegView[3] = 0xDD;

      const jpegBufferPtr = Module._malloc(jpegArrayBuffer.byteLength);
      Module.HEAPU8.set(jpegView, jpegBufferPtr);

      const outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outBufferWidthPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outBufferHeightPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
      const outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

      Module.setValue(outBufferPtrPtr, 0, 'i32');
      Module.setValue(outBufferWidthPtr, 0, 'i32');
      Module.setValue(outBufferHeightPtr, 0, 'i32');
      Module.setValue(outMsgPtrPtr, 0, 'i32');

      // invoke
      const result = decode_jpeg(jpegBufferPtr, jpegArrayBuffer.byteLength, outBufferPtrPtr, outBufferWidthPtr, outBufferHeightPtr, outMsgPtrPtr);

      const outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
      const outBufferWidth = Module.getValue(outBufferWidthPtr, 'i32');
      const outBufferHeight = Module.getValue(outBufferHeightPtr, 'i32');
      const outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');
      const outMsg = Module.UTF8ToString(outMsgPtr);

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

  describe('High-Level API', () => {

    it('encodes JPEG', (done) => {
      const options = {
        width: 32,
        height: 32,
        quality: 80
      };
      const imageArray = initRgbImage(options.width, options.height);


      api.encode(imageArray, options, (err, encoded) => {
        should.not.exist(err);
        should.exist(encoded);

        encoded.byteLength.should.be.greaterThan(0);

        done(err);
      });
    });

    it('decodes JPEG', (done) => {
      const jpegBuffer = fs.readFileSync(__dirname + '/data/sample.jpg');
      const jpegArray = new ArrayBuffer(jpegBuffer.length);
      const jpegView = new Uint8Array(jpegArray);
      for (let i = 0; i !== jpegBuffer.length; ++i) {
        jpegView[i] = jpegBuffer[i];
      }

      api.decode(jpegArray, (err, decoded) => {
        should.not.exist(err);
        should.exist(decoded);

        decoded.buffer.byteLength.should.be.greaterThan(0);
        decoded.width.should.be.equal(32);
        decoded.height.should.be.equal(32);

        done(err);
      });
    });

    it('cannot encode an image with invalid dimensions', (done) => {
      const options = {
        quality: 80,
        width: 0,
        height: 0,
      };
      const imageArray = initRgbImage(options.width, options.height);

      api.encode(imageArray, options, (err, encoded) => {
        should.exist(err);
        should.not.exist(encoded);

        done(encoded);
      });
    });

    it('cannot decode a corrupted JPEG', (done) => {
      const jpegArrayBuffer = new ArrayBuffer(4);
      const jpegView = new Uint8Array(jpegArrayBuffer);
      jpegView[0] = 0xAA;
      jpegView[1] = 0xBB;
      jpegView[2] = 0xCC;
      jpegView[3] = 0xDD;

      api.decode(jpegArrayBuffer, (err, decoded) => {
        should.exist(err);
        should.not.exist(decoded);

        done(decoded);
      });
    });
  });
});
