'use strict';

const jpegasm = require('../dist/jpegasm');
const { initRgbImage } = require('./util/image');

const should = require('should');
const fs = require('fs');

describe('JpegAsm Web Dist', () => {

  it("dist bundle can be used to encode an image", (done) => {
    const options = {
      quality: 80,
      width: 32,
      height: 32,
    };

    const imageArray = initRgbImage(options.width, options.height);

    jpegasm.encode(imageArray, options, (err, encoded) => {
      should.not.exist(err);
      should.exist(encoded);

      encoded.byteLength.should.be.greaterThan(0);

      done(err);
    });
  });

  it("dist bundle can be used to decode an image", (done) => {
    const jpegBuffer = fs.readFileSync(__dirname + '/data/sample.jpg');
    const jpegArray = new ArrayBuffer(jpegBuffer.length);
    const jpegView = new Uint8Array(jpegArray);
    for(let i = 0; i !== jpegBuffer.length; ++i) {
      jpegView[i] = jpegBuffer[i];
    }

    jpegasm.decode(jpegArray, (err, decoded) => {
      should.not.exist(err);
      should.exist(decoded);

      decoded.buffer.byteLength.should.be.greaterThan(0);
      decoded.width.should.be.equal(32);
      decoded.height.should.be.equal(32);

      done(err);
    });
  });

});
