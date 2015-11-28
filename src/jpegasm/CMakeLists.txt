cmake_minimum_required(VERSION 3.2)
project(jpegasm)

get_filename_component(ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}" PATH)
message(STATUS "ROOT_DIR: " ${ROOT_DIR})

find_package(JPEG REQUIRED)
include_directories(${JPEG_INCLUDE_DIRS})

set(JPEGASM_DIR ${ROOT_DIR}/jpegasm)

set(JPEGASM_SOURCES
  ${JPEGASM_DIR}/api.c
)

add_compile_options(
  -Wall
  -fPIC
)

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -std=c11")

add_library(jpegasm SHARED ${JPEGASM_SOURCES})
target_link_libraries(jpegasm ${JPEG_LIBRARIES})
