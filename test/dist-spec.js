'use strict';

const jpegasm = require('../dist/jpegasm');
const { initRgbImage } = require('./util/image');

const should = require('should');
const fs = require('fs');

describe('JpegAsm', () => {

  it("dist bundle can be used to encode an image", () => {
    const quality = 80;
    const imageWidth = 32;
    const imageHeight = 32;
    const imageArray = initRgbImage(imageWidth, imageHeight);

    const encoded = jpegasm.encode(imageArray, imageWidth, imageHeight, quality);

    encoded.byteLength.should.be.greaterThan(0);
  });

  it("dist bundle can be used to decode an image", () => {
    const jpegBuffer = fs.readFileSync(__dirname + '/data/sample.jpg');
    const jpegArray = new ArrayBuffer(jpegBuffer.length);
    const jpegView = new Uint8Array(jpegArray);
    for(let i = 0; i !== jpegBuffer.length; ++i) {
      jpegView[i] = jpegBuffer[i];
    }

    const decodedObj = jpegasm.decode(jpegArray);

    decodedObj.buffer.byteLength.should.be.greaterThan(0);
    decodedObj.width.should.be.equal(32);
    decodedObj.height.should.be.equal(32);
  });

});
