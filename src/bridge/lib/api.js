'use strict';

const Module = require('../build/libjpegasm');
const Runtime = Module;

module.exports.encode = encodeJpeg;
module.exports.decode = decodeJpeg;

/* see 'api.h' for declarations */
const encode_jpeg = Module.cwrap('encode_jpeg', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
const decode_jpeg = Module.cwrap('decode_jpeg', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);

const SIZE_OF_POINTER = 4;


/**
 * Encodes RGB data as JPEG.
 *
 * @param rgbArray ArrayBuffer - An array or RGB triplets.
 * @param rgbWidth Width of RGB image, pixels.
 * @param rgbHeight Height of RGB image, pixels.
 * @param quality A quality, [0 - 100]
 * @return An ArrayBuffer with the encoded data
 * Throws an 'Error' in case of any error condition.
 */
function encodeJpeg(rgbArray, rgbWidth, rgbHeight, quality) {
  const stack = Runtime.stackSave();

  const rgbBufferPtr = Module._malloc(rgbArray.byteLength);
  Module.HEAPU8.set(new Uint8Array(rgbArray), rgbBufferPtr);

  const outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
  const outBufferSizePtr = Runtime.stackAlloc(SIZE_OF_POINTER);
  const outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

  Module.setValue(outBufferPtrPtr, 0, 'i32');
  Module.setValue(outBufferSizePtr, 0, 'i32');
  Module.setValue(outMsgPtrPtr, 0, 'i32');

  // invoke
  const result = encode_jpeg(rgbBufferPtr, rgbWidth, rgbHeight, quality, outBufferPtrPtr, outBufferSizePtr, outMsgPtrPtr);

  const outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
  const outBufferSize = Module.getValue(outBufferSizePtr, 'i32');
  const outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');

  let err;
  let encoded;

  if(!result) {
    const jpegBuffer = new Uint8Array(Module.HEAPU8.buffer, outBufferPtr, outBufferSize);
    encoded = new ArrayBuffer(outBufferSize);
    new Uint8Array(encoded).set(jpegBuffer);
  } else {
    err = new Error(Module.Pointer_stringify(outMsgPtr));
  }

  Module._free(rgbBufferPtr);
  Module._free(outBufferPtr);
  Module._free(outMsgPtr);

  Runtime.stackRestore(stack);

  if(err) {
    throw err;
  }

  return encoded;
}

/**
 * Decodes JPEG
 * @param jpegArray An ArrayBuffer with JPEG data.
 * @return An object: { buffer: ArrayBuffer, width: number, height: number }.
 * Throws an Error in case of any error condition.
 */
function decodeJpeg(jpegArray) {
  const stack = Runtime.stackSave();

  const jpegBufferPtr = Module._malloc(jpegArray.byteLength);
  Module.HEAPU8.set(new Uint8Array(jpegArray), jpegBufferPtr);  

  const outBufferPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
  const outBufferWidthPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
  const outBufferHeightPtr = Runtime.stackAlloc(SIZE_OF_POINTER);
  const outMsgPtrPtr = Runtime.stackAlloc(SIZE_OF_POINTER);

  Module.setValue(outBufferPtrPtr, 0, 'i32');
  Module.setValue(outBufferWidthPtr, 0, 'i32');
  Module.setValue(outBufferHeightPtr, 0, 'i32');
  Module.setValue(outMsgPtrPtr, 0, 'i32');

  const result = decode_jpeg(jpegBufferPtr, jpegArray.byteLength, outBufferPtrPtr, outBufferWidthPtr, outBufferHeightPtr, outMsgPtrPtr);

  const outBufferPtr = Module.getValue(outBufferPtrPtr, 'i32');
  const outBufferWidth = Module.getValue(outBufferWidthPtr, 'i32');
  const outBufferHeight = Module.getValue(outBufferHeightPtr, 'i32');
  const outMsgPtr = Module.getValue(outMsgPtrPtr, 'i32');

  let err;
  let decoded;

  if(!result) {
    const outBufferSize = outBufferWidth * outBufferHeight * 3;
    const rgbBuffer = new Uint8Array(Module.HEAPU8.buffer, outBufferPtr, outBufferSize);
    decoded = new ArrayBuffer(outBufferSize);
    new Uint8Array(decoded).set(rgbBuffer);
  } else {
    err = new Error(Module.Pointer_stringify(outMsgPtr));
  }

  Module._free(jpegBufferPtr);
  Module._free(outBufferPtr);
  Module._free(outMsgPtr);

  Runtime.stackRestore(stack);

  if(err) {
    throw err;
  }

  return {
    buffer: decoded,
    width: outBufferWidth,
    height: outBufferHeight
  };
}
