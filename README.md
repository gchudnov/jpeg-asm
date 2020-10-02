# jpeg-asm

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

- [Examples of usage](https://github.com/gchudnov/jpeg-asm/tree/master/examples)

### Decode JPEG
```javascript
var jpegasm = require('jpeg-asm');

var buf = new ArrayBuffer(...);
// init buffer

var decoded = jpegasm.decode(buf);
// decoded: { buffer: ArrayBuffer, width: number, height: number }
```

### Encode JPEG
```javascript
var jpegasm = require('jpeg-asm');

var buf = new ArrayBuffer(...);
// init buffer

var width = X;
var height = Y;
var quality = 80;

var encoded = jpegasm.encode(buf, width, height, quality);
```

## API

### .decode(buf)
Decodes a JPEG image.

Arguments:
* `buf` - source buffer: `ArrayBuffer`

Returns:
* An object with the following properties: { buffer: ArrayBuffer, width: number, height: number }

Throws an exception in case of any error.

```javsscript
var decoded = jpegasm.decode(buf);
```

### .encode(buf, widtht, height, quality);
Encodes buffer to a JPEG format.

Arguments:
* `buf` - source buffer: `ArrayBuffer`
* `width` - width of the image in `buf`
* `height`- height of the image in `buf`
* `quality` - a numberic value [0-100], describes quality of encoding. 0 - low quality, 100 - high quality.

Returns:
* `ArrayBuffer` with encoded data.

Throws an exception in case of any error.

```javascript
var encoded = jpegasm.encode(buf, width, height, 80);
```

## Tests

To run the tests for *jpeg-asm*:
```bash
npm test
```

## Building

To build a browser-friendly version of the library, run:
 
```bash
npm run browser:debug
# OR
npm run browser:release  # builds minified version
```

## Contact

[Grigoriy Chudnov] (mailto:g.chudnov@gmail.com)


## License

jpeg-asm distributed under the [The MIT License (MIT)](LICENSE).

libjpeg has a custom [BSD](https://en.wikipedia.org/wiki/BSD_licenses)-like license ([free software](https://en.wikipedia.org/wiki/Free_software)).
