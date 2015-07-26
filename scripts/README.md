# Building jpegasm

## source 'emsdk_env.sh'
```bash
$ cd emsdk_portable/
$ source ./emsdk_env.sh
```

## copy jpeg-9a to deps/:
```bash
$ cd jpeg-asm/
$ mkdir deps
$ cp /path-to/jpeg-9a ./deps
```

## Build libjpeg with emscripten
```bash
$ cd jpeg-asm/
$ ./scripts/embuild.sh --lib=jpeg --purge
$ ./scripts/embuild.sh --lib=jpeg --configure
$ ./scripts/embuild.sh --lib=jpeg --make
```

## Build libjpegasm with emscripten
```bash
$ cd jpeg-asm/
$ ./scripts/embuild.sh --lib=jpegasm
```


To build a `DEBUG` version, add --debug to all 'embuild.sh' invocations, e.g.:
```bash
$ ./scripts/embuild.sh --lib=jpeg --purge --debug
$ ./scripts/embuild.sh --lib=jpeg --configure --debug
$ ./scripts/embuild.sh --lib=jpeg --make --debug
$ ./scripts/embuild.sh --lib=jpegasm --debug
```
