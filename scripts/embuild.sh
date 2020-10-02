#!/usr/bin/env bash
set -e

LIBJPEG_NAME="jpeg-9d"

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
    CFLAGS='-fPIC -s EXPORT_ALL=1'
  else
    CFLAGS='-fPIC -O2 -s EXPORT_ALL=1'
  fi

  set -x
  (cd "${LIBJPEG_DIR}"; emconfigure ./configure --enable-shared=no --enable-static=yes CFLAGS="${CFLAGS}")
  set +x
}

function make_libjpeg() {
  set -x
  (cd "${LIBJPEG_DIR}"; emmake make -j8 VERBOSE=1)
  set +x
}

function clean_libjpeg() {
  set -x
  (cd "${LIBJPEG_DIR}"; make distclean)
  set +x
}

# build libjpeg
function build_libjpeg() {
  if [[ "${IS_CLEAN}" -eq 1 ]]; then
    set +e
    clean_libjpeg
    set -e
  fi

  if [[ "${IS_CONFIGURE}" -eq 1 ]]; then
    configure_libjpeg
  fi

  if [[ "${IS_MAKE}" -eq 1 ]]; then
    make_libjpeg
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
    CFLAGS="-std=c11 -fPIC -s ALLOW_MEMORY_GROWTH=1"
  else
    PRE_POST=
    CFLAGS="-std=c11 -fPIC -O3 -s ALLOW_MEMORY_GROWTH=1 --memory-init-file 0"
  fi

  local JPEG_A_PATH=
  local C_API_PATH=
  local EXP_FUNC_PATH=

  JPEG_A_PATH=$(readlink -f "../deps/${LIBJPEG_NAME}/.libs/libjpeg.a")
  JPEG_INC_PATH=$(readlink -f "../deps/${LIBJPEG_NAME}")
  C_API_PATH=$(readlink -f "${JPEGASM_DIR}/api.c")
  EXP_FUNC_PATH=$(readlink -f "../scripts/exported_functions")

  # TODO: check if -s MAIN_MODULE=1 is required
  # TODO: '-s USE_LIBJPEG' can be used, but is pulls prev libjpeg version, 9c.

  set -x
  mkdir -p "${ROOT_DIR}/build"
  cd "${ROOT_DIR}/build"
  "${EMCC}" ${CFLAGS} "${C_API_PATH}" -I"${JPEG_INC_PATH}" -s SIDE_MODULE=1 -s EXPORT_ALL=1 -c -o lib"${LIBNAME}".bc
  "${EMCC}" ${CFLAGS} "${PRE_POST}" "${JPEG_A_PATH}" lib${LIBNAME}.bc -s EXPORTED_FUNCTIONS=@"${EXP_FUNC_PATH}" -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["ccall", "cwrap", "setValue", "getValue", "UTF8ToString"]' -s WASM=0 -o lib"${LIBNAME}".js
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
