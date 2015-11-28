cmake_minimum_required(VERSION 3.2)
project(jpegasm_test)

get_filename_component(ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}" PATH)
message(STATUS "ROOT_DIR: " ${ROOT_DIR})

find_package(GTest REQUIRED)
include_directories(${GTEST_INCLUDE_DIRS})

find_package(Threads)

set(TEST_DIR ${ROOT_DIR}/test)

# configure path to the data directory
get_filename_component(TEST_DIR "." ABSOLUTE)
configure_file(${TEST_DIR}/api-spec.h.in ${TEST_DIR}/api-spec.h)

include_directories(${ROOT_DIR}/jpegasm)

set(TEST_SOURCES
  ${TEST_DIR}/driver.cpp
  ${TEST_DIR}/api-spec.cpp
)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++14")

add_executable(jpegasm_test ${TEST_SOURCES})
target_link_libraries(jpegasm_test ${GTEST_LIBRARIES} ${CMAKE_THREAD_LIBS_INIT} jpegasm)

# configure unit tests via CTest
enable_testing()
add_test(NAME RunTests COMMAND jpegasm_test)
