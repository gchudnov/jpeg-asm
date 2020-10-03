# jpeg-asm

![jpeg-asm-logo](data/stamp-128.png)

![Node.js CI](https://github.com/gchudnov/jpeg-asm/workflows/Node.js%20CI/badge.svg)

> Encoding and decoding images via libjpeg

```
libjpeg version: 9d of 12-Jan-2020
```

## Installation

installing with npm:
```bash
npm install jpeg-asm --save
```

OR

Use `/dist/jpegasm.js` for a browser-friendly version of the library.

### Decode JPEG

```javascript
const jpegasm = require('jpeg-asm');

const buf = new ArrayBuffer(/* ... */);

// init buffer

jpegasm.decode(buf, (err, decoded) => {
  // err: Error
  // OR
  // decoded: { buffer: ArrayBuffer, width: number, height: number }
});

```

### Encode JPEG

```javascript
const jpegasm = require('jpeg-asm');

const buf = new ArrayBuffer(/* ... */);

// init buffer

const options = {
  width: X,
  height: Y,
  quality: 80
};

jpegasm.encode(buf, options, (err, encoded) => {
  // err: Error
  // OR
  // encoded: ArrayBuffer
});
```

### Examples

The [examples](https://github.com/gchudnov/jpeg-asm/tree/master/examples) directory contains an example how to encode and decode an image in a browser.


## API

### .decode(buf, cb)

Decodes a JPEG image.

Arguments:
* `buf` - source buffer: `ArrayBuffer`
* `cb` - a callback that gets 2 arguments:
  * `err` - decoding `Error`
  * `decoded` - an object that describes the decoded image: `{ width: number, height: number, data: ArrayBuffer }`
                where data represents colors in RGB format.
                
```javsscript
jpegasm.decode(buf, (err, decoded) => { /* ... */ });
```

### .encode(buf, options, cb)

Encodes buffer to a JPEG format.

Arguments:
* `buf` - source buffer: `ArrayBuffer`
* `[options]` - an optional object with settings to encode an image. Supported options:
  * `width` - width of the image in `buf`
  * `height`- height of the image in `buf`
  * `quality` - a numberic value [0-100], describes quality of encoding. 0 - low quality, 100 - high quality.
* `cb` - a callback that gets 2 arguments:
  * `err` - encoding `Error`
  * `encoded` - an object that describes the encoded image: `{ width: number, height: number, data: ArrayBuffer }`

```javascript
const encoded = jpegasm.encode(buf, options, (err, encoded) => { /* ... */ });
```

## Tests

To run the tests for *jpeg-asm*:

```bash
npm test
```

## Building

To compile libjpeg to javascript:

```bash
npm run build:debug
# OR
npm run build:release
```

Compiling [details](scripts/README.md).

To build a browser-friendly version of the library, run:
 
```bash
npm run browser:debug
# OR
npm run browser:release
```

## Contact

[Grigorii Chudnov] (mailto:g.chudnov@gmail.com)


## License

jpeg-asm distributed under the [The MIT License (MIT)](LICENSE).

libjpeg has a custom [BSD](https://en.wikipedia.org/wiki/BSD_licenses)-like license ([free software](https://en.wikipedia.org/wiki/Free_software)).
