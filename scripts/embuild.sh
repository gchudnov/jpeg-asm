#!/usr/bin/env bash
set -e

LIBJPEG_NAME="jpeg-9a"

SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)
ROOT_DIR=$(readlink -f "${SCRIPT_DIR}/../")
LIBJPEG_DIR=$(readlink -f "${SCRIPT_DIR}/../deps/${LIBJPEG_NAME}")
JPEGASM_DIR="../src/jpegasm"

LIBNAME=

IS_DEBUG=
IS_CLEAN=
IS_CONFIGURE=
IS_MAKE=

# print an error
function fatal() {
  echo "$0:" "$@" >&2
  exit 1
}

function usage() {
  echo "Usage: ${SCRIPT_NAME} [OPTIONS]

Builds libjpeg and libjpegasm.

Examples:
  ${SCRIPT_NAME} --lib=jpeg --configure --make
    - Configure & make libjpeg.

  ${SCRIPT_NAME} --lib=jpegasm
    - Configure & make libjpegasm.

Options:
    -h|--help       Display this help message.
    -l=*|--lib=*    Library to process: jpeg | jpegasm.
    -c|--configure  Configure the library.
    -m|--make       Make the library.
    -p|--purge      Invokes distclean.
    -d|--debug      Build the debug version.
"
}

# configures
function configure_libjpeg() {
  CFLAGS=
  if [[ "${IS_DEBUG}" -eq 1 ]]; then
    CFLAGS=
  else
    CFLAGS='-O2'
  fi

set -x
  (cd "${LIBJPEG_DIR}"; emconfigure ./configure CFLAGS="${CFLAGS}")
set +x
}

function make_jpeg() {
set -x
  (cd "${LIBJPEG_DIR}"; emmake make)
set +x
}

function clean_jpeg() {
set -x
  (cd "${LIBJPEG_DIR}"; make distclean)
set +x
}

# build libjpeg
function build_libjpeg() {
  if [[ "${IS_CLEAN}" -eq 1 ]]; then
    set +e
    clean_jpeg
    set -e
  fi

  if [[ "${IS_CONFIGURE}" -eq 1 ]]; then
    configure_libjpeg
  fi

  if [[ "${IS_MAKE}" -eq 1 ]]; then
    make_jpeg
  fi
}

# build asm
function build_jpegasm {
  pushd "${SCRIPT_DIR}"

  local EMCC=emcc
  local CFLAGS=
  local PRE_POST=

  if [[ "${IS_DEBUG}" -eq 1 ]]; then
    PRE_POST=
    CFLAGS="-std=c11 -s ALLOW_MEMORY_GROWTH=1"
  else
    PRE_POST=
    CFLAGS="-std=c11 -O3 -s ALLOW_MEMORY_GROWTH=1 --memory-init-file 0"
  fi

  set -x
  local JPEG_SO_PATH=../deps/${LIBJPEG_NAME}/.libs/libjpeg.so

  mkdir -p "${ROOT_DIR}/build"
  cd "${ROOT_DIR}/build"
  ${EMCC} "${CFLAGS}" -Wl,-l${JPEG_SO_PATH} ${JPEGASM_DIR}/api.c -I../deps/${LIBJPEG_NAME} -o lib${LIBNAME}.bc
  ${EMCC} "${CFLAGS}" ${PRE_POST} ${JPEG_SO_PATH} lib${LIBNAME}.bc -s EXPORTED_FUNCTIONS=@../scripts/exported_functions -o lib${LIBNAME}.js
  set +x

  popd
}

# Build the specified library
function build_target() {
  if [[ "${LIBNAME}" =~ ^(jpeg|jpegasm)$ ]]; then
    if [[ "${LIBNAME}" == "jpeg" ]]; then
      build_libjpeg
    else
      build_jpegasm
    fi
  else
    fatal "specified library should be 'jpeg' or 'jpegasm', got: ${LIBNAME}"
  fi
}

# if there are no arguments, print usage info
if [ $# -eq 0 ]; then
  usage
  exit
fi

for i in "$@"
do
  case $i in
      -l=*|--lib=*)
      LIBNAME="${i#*=}"
      shift
      ;;
      -c|--configure)
      IS_CONFIGURE=1
      shift
      ;;
      -m|--make)
      IS_MAKE=1
      shift
      ;;
      -p|--purge)
      IS_CLEAN=1
      shift
      ;;
      -d|--debug)
      IS_DEBUG=1
      shift
      ;;
      -h|--help)
      usage
      shift
      ;;
      --default)
      shift
      ;;
      *)
      ;;
  esac
done

build_target
