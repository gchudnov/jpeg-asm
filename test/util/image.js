'use strict';

module.exports.initRgbImage = initRgbImage;

/**
 * Initializes RGB image with data
 * @param width
 * @param height
 */
function initRgbImage(width, height) {
  const imageSize = width * height * 3
  const view = new Uint8Array(imageSize);
  let index;
  for (let y = 0; y !== height; ++y) {
    for (let x = 0; x !== width * 3; x += 3) {
      index = y * width * 3 + x;
      view[index + 0] = 0x00; // R
      view[index + 1] = 0x00; // G
      view[index + 2] = 0xFF; // B
    }
  }

  return view;
}
