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

## Invoke `npm run build:*` commands:
Build the `DEVELOPMENT` version:
```bash
$ npm run build:debug
```

OR 

Build the `PRODUCTION` version:
```bash
$ npm run build:release
```

## Internal Details

`npm run build:(debug|release)` invokes the following commands:

Building `jpeg` with emscripten
```bash
$ cd jpeg-asm/
$ ./scripts/embuild.sh --lib=jpeg --purge
$ ./scripts/embuild.sh --lib=jpeg --configure
$ ./scripts/embuild.sh --lib=jpeg --make
```

Building `jpegasm` with emscripten
```bash
$ cd jpeg-asm/
$ ./scripts/embuild.sh --lib=jpegasm
```

NOTE: Add `--debug` to all 'embuild.sh' invocations to build the `debug` version.
