'use strict';

var Module = require('../../../build/libjpegasm');
var Runtime = Module;

var doneF = new Promise(function(resolve, reject) {
  /**
   * Called asynchronously when the runtime is initialized.
   * It is safe to run 'encode' and 'decode' only after this call.
   */
  Module['onRuntimeInitialized'] = function () {
    try {
      resolve('RuntimeInitialized');
    } catch (err) {
      reject(err);
    }
  }
});

module.exports.encode = encodeJpeg;
module.exports.decode = decodeJpeg;

/* see 'api.h' for declarations */
var encode_jpeg = Module.cwrap('encode_jpeg', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
var decode_jpeg = Module.cwrap('decode_jpeg', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);

var SIZE_OF_POINTER = 4;

var DEFAULT_QUALITY = 90;

/**
 * Encodes RGB data as JPEG.
 *
 * @param {ArrayBuffer} buf An array or RGB tripvars.
 * @param {object} options Params { width: number, height: number, quality: number }
 *                  Width of RGB image, pixels.
 *                  Height of RGB image, pixels.
 *                  Quality, [0 - 100].
 * @param {function} cb Callback to invoke on compvarion.
 *
 * @callback { width: number, height: number, data: Uint8Array }
 */
function encodeJpeg(buf, options, cb) {
  if(typeof options === 'function') {
    cb = options;
    options = {};
  }

  if(!options.hasOwnProperty('width') || !options.hasOwnProperty('height')) {
    return cb(new Error('Width & height of the buffer is not provided.'));
  }

  var width = options.width;
  var height = options.height;
  var quality = options.quality || DEFAULT_QUALITY;

  doneF.then(function() {
    var stack = Runtime.stackSave();

    var rgbBufferPtr = Module._malloc(buf.byteLength);
    Module.HEAPU8.set(new Uint8Array(buf), rgbBufferPtr);

    var outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
    var outBufferSizePtr = Runtime.stackAlloc(SIZE_OF_POINTER);
    var outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

    Module.setValue(outBufferPtrPtr, 0, 'i32');
    Module.setValue(outBufferSizePtr, 0, 'i32');
    Module.setValue(outMsgPtrPtr, 0, 'i32');

    // invoke
    var result = encode_jpeg(rgbBufferPtr, width, height, quality, outBufferPtrPtr, outBufferSizePtr, outMsgPtrPtr);

    var outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
    var outBufferSize = Module.getValue(outBufferSizePtr, 'i32');
    var outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');

    var err;
    var encoded;

    if (!result) {
      var jpegBuffer = new Uint8Array(Module.HEAPU8.buffer, outBufferPtr, outBufferSize);
      encoded = new ArrayBuffer(outBufferSize);
      new Uint8Array(encoded).set(jpegBuffer);
    } else {
      err = new Error(Module.Pointer_stringify(outMsgPtr));
    }

    Module._free(rgbBufferPtr);
    Module._free(outBufferPtr);
    Module._free(outMsgPtr);

    Runtime.stackRestore(stack);

    if (err) {
      return cb(err);
    } else {
      return cb(null, encoded);
    }
  })
    .catch(cb)
}

/**
 * Decodes JPEG
 * @param buf An ArrayBuffer with JPEG data.
 * @param cb Callback to invoke on compvarion.
 *
 * @callback { buffer: ArrayBuffer, width: number, height: number }.
 */
function decodeJpeg(buf, cb) {
  doneF.then(function() {
    var stack = Runtime.stackSave();

    var jpegBufferPtr = Module._malloc(buf.byteLength);
    Module.HEAPU8.set(new Uint8Array(buf), jpegBufferPtr);

    var outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
    var outBufferWidthPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
    var outBufferHeightPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
    var outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

    Module.setValue(outBufferPtrPtr, 0, 'i32');
    Module.setValue(outBufferWidthPtr, 0, 'i32');
    Module.setValue(outBufferHeightPtr, 0, 'i32');
    Module.setValue(outMsgPtrPtr, 0, 'i32');

    var result = decode_jpeg(jpegBufferPtr, buf.byteLength, outBufferPtrPtr, outBufferWidthPtr, outBufferHeightPtr, outMsgPtrPtr);

    var outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
    var outBufferWidth = Module.getValue(outBufferWidthPtr, 'i32');
    var outBufferHeight = Module.getValue(outBufferHeightPtr, 'i32');
    var outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');

    var err;
    var decoded;

    if (!result) {
      var outBufferSize = outBufferWidth * outBufferHeight * 3;
      var rgbBuffer = new Uint8Array(Module.HEAPU8.buffer, outBufferPtr, outBufferSize);
      decoded = new ArrayBuffer(outBufferSize);
      new Uint8Array(decoded).set(rgbBuffer);
    } else {
      err = new Error(Module.Pointer_stringify(outMsgPtr));
    }

    Module._free(jpegBufferPtr);
    Module._free(outBufferPtr);
    Module._free(outMsgPtr);

    Runtime.stackRestore(stack);

    if (err) {
      return cb(err);
    } else {
      return cb(null, {
        buffer: decoded,
        width: outBufferWidth,
        height: outBufferHeight
      });
    }
  })
    .catch(cb)
}
