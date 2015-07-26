# jpeg-asm

> libjpeg compiled into JavaScript

## Installation

installing with npm:
```bash
$ npm install jpeg-asm --save
```

### Decode JPEG
```javascript
var jpegasm = require('jpeg-asm');

var buf = new ArrayBuffer(N);
// init buffer

var decoded = jpegasm.decode(buf);
// decoded: { buffer: ArrayBuffer, width: number, height: number }
```

### Encode JPEG
```javascript
var jpegasm = require('jpeg-asm');

var buf = new ArrayBuffer(N);
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
var encoded = inkjet.encode(buf, width, height, 80);
```

## Tests

To run the tests for _jpeg-asm_:
```bash
$ npm test
```

## Contact

[Grigoriy Chudnov] (mailto:g.chudnov@gmail.com)


## License

libjpeg has a custom [BSD](https://en.wikipedia.org/wiki/BSD_licenses)-like license ([free software](https://en.wikipedia.org/wiki/Free_software)).

jpeg-asm distributed under the [The MIT License (MIT)](https://github.com/gchudnov/inkjet/blob/master/LICENSE).
