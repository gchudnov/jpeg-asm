#!/usr/bin/env bash
set -e

JPEG_NAME="jpeg-9a"

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)
ROOT_DIR=$(readlink -f "${SCRIPT_DIR}/../")
JPEG_DIR=$(readlink -f "${SCRIPT_DIR}/../deps/${JPEG_NAME}")

# print an error
function fatal {
  echo "$0:" "$@" >&2
  exit 1
}


function usage {
  script=$(basename "$0")
  echo "Usage: $script [OPTIONS]

Compiles libjpeg and libjpegasm into JavaScript.

Examples:
  $script --lib=jpeg --configure --make
    - Configure & make libjpeg.

  $script --lib=jpegasm
    - Configure & make libjpegasm.

Options:
    -h|--help       Display this help message.
    -l=*|--lib=*    Library to process: jpeg | jpegasm.
    -c|--configure  Configure the library.
    -m|--make       Make the library.
"
}

function configure_jpeg {
  (cd ${JPEG_DIR}; emconfigure ./configure)
}

function make_jpeg {
  (cd ${JPEG_DIR}; emmake make)
}

# build libjpeg
function jpeg {
  local is_confugure=$1
  local is_make=$2

  if [[ $is_confugure -eq 1 ]]; then
    configure_jpeg
  fi

  if [[ $is_make -eq 1 ]]; then
    make_jpeg
  fi
}

function jpegasm_build {
set -x
  pushd ${SCRIPT_DIR}

  EMCC=emcc
  CFLAGS="-std=c11"

  JPEG_SO_PATH=../deps/${JPEG_NAME}/.libs/libjpeg.so

  mkdir -p ${ROOT_DIR}/build
  cd ${ROOT_DIR}/build
  ${EMCC} ${CFLAGS} -Wl,-l${JPEG_SO_PATH} ../jpegasm/api.c -I../deps/${JPEG_NAME} -o jpegasm.bc
  ${EMCC} ${CFLAGS} ${JPEG_SO_PATH} jpegasm.bc -s EXPORTED_FUNCTIONS=@../scripts/exported_functions -o jpegasm.js

  popd

set +x
}

# build libjpegasm
function jpegasm {
  jpegasm_build
}

# Build the specified library
function lib {
  local libname=$1

  if [[ $1 =~ ^(jpeg|jpegasm)$ ]]; then
    if [[ $1 == "jpeg" ]]; then
      jpeg $2 $3
    else
      jpegasm
    fi
  else
    fatal "Invalid library: $1"
  fi
}

# if there are no arguments, print usage info
if [ $# -eq 0 ]; then
  usage
  exit
fi


LIBNAME=
CONFIGURE=0
MAKE=0

for i in "$@"
do
  case $i in
      -l=*|--lib=*)
      LIBNAME="${i#*=}"
      shift
      ;;
      -c|--configure)
      CONFIGURE=1
      shift
      ;;
      -m|--make)
      MAKE=1
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

lib ${LIBNAME} ${CONFIGURE} ${MAKE}
