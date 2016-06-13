"use strict";

module.exports = {
  getLuminance(colour) {
    // Calculate relative luminance according to https://www.w3.org/TR/WCAG/#relativeluminancedef
    for (let i = 0; i < 3; i++) {
      colour[i] /= 255;
      if (colour[i] <= 0.03928) {
        colour[i] /= 12.92;
      } else {
        colour[i] = Math.pow((colour[i] + 0.055) / 1.055, 2.4);
      }
    }
    return 0.2125 * colour[0] + 0.7154 * colour[1] + 0.0721 * colour[2];
  },
  getContrastRatio(l1, l2) {
    // Calculate contrast ratio according to https://www.w3.org/TR/WCAG/#contrast-ratiodef
    return Math.max(l1 + 0.05, l2 + 0.05) / Math.min(l1 + 0.05, l2 + 0.05);
  },
  // colour is from getComputedStyle which always returns rgb or rgba
  extractRGBFromCSSColour(colour) {
    let isAlpha = colour.startsWith("rgba");
    let [r, g, b] = colour.split(",");
    r = isAlpha ? r.substring(5, r.length) : r.substring(4, r.length);
    b = isAlpha ? b : b.substring(0, b.length - 1);
    return [Math.floor(r), Math.floor(g), Math.floor(b)];
  }
}