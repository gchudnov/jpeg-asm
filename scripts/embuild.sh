#!/usr/bin/env bash
set -e

JPEG_NAME="jpeg-9a"

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)
ROOT_DIR=$(readlink -f "${SCRIPT_DIR}/../")
JPEG_DIR=$(readlink -f "${SCRIPT_DIR}/../deps/${JPEG_NAME}")
SRC_DIR="../src/jpegasm"

LIBNAME=
OPT_CONFIGURE=0
OPT_MAKE=0
OPT_CLEAN=0
OPT_DEBUG=0

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
    -p|--purge      Invokes distclean.
    -d|--debug      Build the debug version.
"
}

function configure_jpeg {
  CFLAGS=
  if [[ $DEBUG -eq 1 ]]; then
    CFLAGS=
  else
    CFLAGS='-O2'
  fi

set -x
  (cd ${JPEG_DIR}; emconfigure ./configure CFLAGS=${CFLAGS})
set +x
}

function make_jpeg {
set -x
  (cd ${JPEG_DIR}; emmake make)
set +x
}

function clean_jpeg {
set -x
  (cd ${JPEG_DIR}; make distclean)
set +x
}

# build libjpeg
function jpeg {
  if [[ $CLEAN -eq 1 ]]; then
    set +e
    clean_jpeg
    set -e
  fi

  if [[ $CONFIGURE -eq 1 ]]; then
    configure_jpeg
  fi

  if [[ $MAKE -eq 1 ]]; then
    make_jpeg
  fi
}

function jpegasm_build {
  pushd ${SCRIPT_DIR}

  EMCC=emcc
  CFLAGS=
  PRE_POST=

  if [[ $DEBUG -eq 1 ]]; then
    PRE_POST=
    CFLAGS="-std=c11"
  else
    PRE_POST=
    CFLAGS="-std=c11 -O3 --closure 1 --memory-init-file 0"
  fi

set -x
  JPEG_SO_PATH=../deps/${JPEG_NAME}/.libs/libjpeg.so

  mkdir -p ${ROOT_DIR}/build
  cd ${ROOT_DIR}/build
  ${EMCC} ${CFLAGS} -Wl,-l${JPEG_SO_PATH} ${SRC_DIR}/api.c -I../deps/${JPEG_NAME} -o jpegasm.bc
  ${EMCC} ${CFLAGS} ${PRE_POST} ${JPEG_SO_PATH} jpegasm.bc -s EXPORTED_FUNCTIONS=@../scripts/exported_functions -o jpegasm.js
set +x

  popd
}

# build libjpegasm
function jpegasm {
  jpegasm_build
}

# Build the specified library
function process_lib {
  if [[ $LIBNAME =~ ^(jpeg|jpegasm)$ ]]; then
    if [[ $LIBNAME == "jpeg" ]]; then
      jpeg
    else
      jpegasm
    fi
  else
    fatal "Invalid library:$LIBNAME"
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
      CONFIGURE=1
      shift
      ;;
      -m|--make)
      MAKE=1
      shift
      ;;
      -p|--purge)
      CLEAN=1
      shift
      ;;
      -d|--debug)
      DEBUG=1
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

process_lib
