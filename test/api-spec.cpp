#include <gtest/gtest.h>
#include <fstream>
#include <vector>
#include <stdexcept>
#include "api-spec.h"
#include "./../src/jpegasm/api.h"

using namespace std;


class AJpegAsm : public ::testing::Test {
public:
  static const unsigned int rgb_width = 32;
  static const unsigned int rgb_height = 32;

  unsigned char rgb_buffer[rgb_width * rgb_height * 3];

public:
  AJpegAsm() {
    init_rgb_image();
  }

protected:
  void init_rgb_image() {
    unsigned int ptr;
    for(unsigned int y = 0; y != rgb_height; ++y) {
      for(unsigned int x = 0; x != rgb_width * 3; x += 3) {
        ptr = y * rgb_width * 3 + x;
        rgb_buffer[ptr + 0] = 0x00; // R
        rgb_buffer[ptr + 1] = 0x00; // G
        rgb_buffer[ptr + 2] = 0xFF; // B
      }
    }
  }

  void save_buffer(const std::string& filepath, unsigned char* buffer, unsigned long buffer_size) {
    std::ofstream ofs(filepath.c_str(), std::ios_base::out | std::ios_base::binary);
    if(ofs) {
      ofs.write(reinterpret_cast<char*>(buffer), buffer_size);
      ofs.close();
    } else {
      throw std::runtime_error("Cannot open the file for writing");
    }
  }

  std::vector<unsigned char> load_buffer(const std::string& filepath) {
    std::vector<unsigned char> result;
    std::ifstream ifs(filepath.c_str(), std::ios_base::in | std::ios_base::binary);
    if (ifs) {
      ifs.seekg(0, std::ios_base::end);
      size_t length = static_cast<size_t>(ifs.tellg());
      ifs.seekg(0, std::ios_base::beg);

      result.resize(length);

      ifs.read(reinterpret_cast<char*>(&result[0]), length);
      ifs.close();
    } else {
      throw std::runtime_error("Cannot open the file for reading");
    }
    return result;
  }
};


TEST_F(AJpegAsm, EncodesJpeg) {
  int quality = 80;
  unsigned char* jpeg_buffer = nullptr;
  unsigned int jpeg_buffer_size = 0;

  char* out_msg = nullptr;

  int result = encode_jpeg(rgb_buffer, rgb_width, rgb_height, quality, &jpeg_buffer, &jpeg_buffer_size, &out_msg);

  ASSERT_EQ(0, result);
  ASSERT_TRUE(out_msg == nullptr);
  ASSERT_TRUE(jpeg_buffer != nullptr);
  ASSERT_GT(jpeg_buffer_size, 0);

  save_buffer(std::string(TEST_DIR) + "/out/encoded-by-cpp.jpg", jpeg_buffer, jpeg_buffer_size);

  free(jpeg_buffer);
  free(out_msg);
}

TEST_F(AJpegAsm, DecodesJpeg) {
  std::vector<unsigned char> jpeg_buffer = load_buffer(std::string(TEST_DIR) + "/data/sample.jpg");

  unsigned char* new_buffer = nullptr;
  unsigned int new_width = 0;
  unsigned int new_height = 0;

  char* out_msg = nullptr;

  int result = decode_jpeg(&jpeg_buffer[0], (unsigned int)jpeg_buffer.size(), &new_buffer, &new_width, &new_height, &out_msg);

  ASSERT_EQ(0, result);
  ASSERT_TRUE(out_msg == nullptr);
  ASSERT_TRUE(new_buffer != nullptr);
  ASSERT_EQ(32, new_width);
  ASSERT_EQ(32, new_height);

  free(new_buffer);
  free(out_msg);
}

TEST_F(AJpegAsm, CannotEncodeAnImageWithInvalidDimensions) {
  unsigned char* in_buffer = rgb_buffer;
  unsigned int in_width = 0;
  unsigned int in_height = 0;

  int quality = 80;

  unsigned char* jpeg_buffer = nullptr;
  unsigned int jpeg_buffer_size = 0;

  char* out_msg = nullptr;

  int result = encode_jpeg(in_buffer, in_width, in_height, quality, &jpeg_buffer, &jpeg_buffer_size, &out_msg);

  ASSERT_EQ(33, result);
  ASSERT_TRUE(out_msg != nullptr);

  free(jpeg_buffer);
  free(out_msg);
}

TEST_F(AJpegAsm, CannotDecodeACorruptedImage) {
  std::vector<unsigned char> jpeg_buffer{ 0xAA, 0xBB, 0xCC, 0xDD, 0xEE };

  unsigned char* new_buffer = nullptr;
  unsigned int new_width = 0;
  unsigned int new_height = 0;

  char* out_msg = nullptr;

  int result = decode_jpeg(&jpeg_buffer[0], (unsigned int)jpeg_buffer.size(), &new_buffer, &new_width, &new_height, &out_msg);

  ASSERT_EQ(55, result);
  ASSERT_TRUE(out_msg != nullptr);
  ASSERT_TRUE(new_buffer == nullptr);

  free(new_buffer);
  free(out_msg);
}
