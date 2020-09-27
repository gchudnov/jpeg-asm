# Building jpegasm

## Download emscripten

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Download and install the latest SDK tools.
./emsdk install latest

# Make the "latest" SDK "active" for the current user. (writes .emscripten file)
./emsdk activate latest

# Activate PATH and other environment variables in the current terminal
source ./emsdk_env.sh

# Verify installation
emcc -v

# output:
# emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 2.0.4
# ...
```

## Download libjpeg

```bash
cd jpeg-asm/
mkdir -p deps && cd deps/

export LIBJPEG_VERSION=9d
wget "http://ijg.org/files/jpegsrc.v${LIBJPEG_VERSION}.tar.gz"
tar -xzvf "jpegsrc.v${LIBJPEG_VERSION}.tar.gz"
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

## LINKS

- [Independent JPEG Group](http://ijg.org)
- [Emscripten](https://emscripten.org/)
- [Linking](https://github.com/emscripten-core/emscripten/wiki/Linking)
