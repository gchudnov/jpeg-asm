'use strict';

//
// Can be run only for RELEASE-version
//

var api = require('./../dist/jpegasm');

var should = require('should');
var fs = require('fs');

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
    fs.writeFileSync(outDir + filename, new Buffer(arr));
  }

  before(function () {
    initRgbImage();
  });

  describe('High-Level API', function() {

    it('encodes JPEG', function() {
      var quality = 80;

      var encoded = api.encode(rgbArray, rgbWidth, rgbHeight, quality);

      encoded.byteLength.should.be.greaterThan(0);
    });

    it('decodes JPEG', function() {
      var jpegBuffer = fs.readFileSync(__dirname + '/../test/data/sample.jpg');
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
