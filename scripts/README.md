# Building jpegasm

## Copy jpeg-9a to deps/:
```bash
$ cd jpeg-asm/
$ mkdir deps
$ cp /path-to/jpeg-9a ./deps
```

## Source 'emsdk_env.sh'
```bash
$ cd emsdk_portable/
$ source ./emsdk_env.sh
```

## AUTOMATICALLY
Build the `RELEASE` version:
```bash
$ npm run build
```
OR to build the `DEBUG` version:
```bash
$ npm run build-debug
```

## MANUALLY

### Build libjpeg with emscripten
```bash
$ cd jpeg-asm/
$ ./scripts/embuild.sh --lib=jpeg --purge
$ ./scripts/embuild.sh --lib=jpeg --configure
$ ./scripts/embuild.sh --lib=jpeg --make
```

### Build libjpegasm with emscripten
```bash
$ cd jpeg-asm/
$ ./scripts/embuild.sh --lib=jpegasm
```


To build the `DEBUG` version, add --debug to all 'embuild.sh' invocations.
