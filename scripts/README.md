# Building jpegasm

## Download libjpeg

```bash
cd jpeg-asm/
mkdir -p deps && cd deps/

export LIBJPEG_VERSION=9d
wget "http://ijg.org/files/jpegsrc.v${LIBJPEG_VERSION}.tar.gz"
tar -xzvf "jpegsrc.v${LIBJPEG_VERSION}.tar.gz"
```

## Source 'emsdk_env.sh'

```bash
cd emsdk_portable/
source ./emsdk_env.sh
```

## Invoke build commands

Build the `DEVELOPMENT / PRODUCTION` version:

```bash
npm run build:debug
# OR
npm run build:release
```

### Build Details

`npm run build:(debug|release)` invokes the following commands:

Building `jpeg` with emscripten.

```bash
cd jpeg-asm/
./scripts/embuild.sh --lib=jpeg --purge
./scripts/embuild.sh --lib=jpeg --configure
./scripts/embuild.sh --lib=jpeg --make
```

Building `jpegasm` with emscripten.

```bash
cd jpeg-asm/
./scripts/embuild.sh --lib=jpegasm
```

NOTE: Add `--debug` to all 'embuild.sh' invocations to build the `debug` version.
