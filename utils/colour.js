"use strict";

/* global console */

let ColourUtils = module.exports = {
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
  getColourFormat(colour) {
    colour = colour.replace(/\s/g, "");
    if (colour.startsWith("#")) {
      return "hex";
    } else if (colour.startsWith("rgb") || colour.startsWith("rgba")) {
      return "rgb";
    }
    return "hsl";
  },
  toRgb(colour) {
    try {
      colour = colour.replace(/\s/g, "");
      let r, g, b;
      if (ColourUtils.getColourFormat(colour) == "hex") {
        if (colour.length == 4) {
          colour = "#" + colour[1].repeat(2) + colour[2].repeat(2) + colour[3].repeat(2);
        }
        r = "0x" + colour[1] + colour[2];
        g = "0x" + colour[3] + colour[4];
        b = "0x" + colour[5] + colour[6];
      } else {
        let isAlpha = colour.startsWith("rgba");
        ([r, g, b] = colour.split(","));
        r = isAlpha ? r.substring(5, r.length) : r.substring(4, r.length);
        b = isAlpha ? b : b.substring(0, b.length - 1);
      }
      return [Math.floor(Number(r)), Math.floor(Number(g)), Math.floor(Number(b))];
    } catch (e) {
      console.log("vivaldifox: toRgb failed with", colour);
      return undefined;
    }
  },
  getColourFromImage(imgEl) {
    let doc = imgEl.ownerDocument;
    let canvas = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    let ctx = canvas.getContext("2d");
    let colours = [];
    // This will:
    // - Take the median of a sorted list of colours (excluding shades of gray)
    // - If image only contains shades of gray, it takes the average instead
    let width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth;
    let height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight;
    ctx.drawImage(imgEl, 0, 0);
    // ctx.fillStyle = "orange";
    // ctx.fillRect(0, 0, width, height);
    let data = ctx.getImageData(0, 0, width, height).data;
    let count = 0;
    let rValues = [], gValues = [], bValues = [];
    let rAvg = 0, gAvg = 0, bAvg = 0;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a !== 255) {
        r = (a / 255) * r;
        g = (a / 255) * g;
        b = (a / 255) * b;
      }
      // Transparent pixel, move on
      if (r == 0 && g == 0 && b == 0 && a == 0) {
        continue;
      }
      rAvg += r;
      gAvg += g;
      bAvg += b;
      count++;
      // Shade of gray, move on
      if (r == g && g == b) {
        continue;
      }
      if (rValues.indexOf(r) == -1) {
        rValues.push(r);
      }
      if (gValues.indexOf(g) == -1) {
        gValues.push(g);
      }
      if (bValues.indexOf(b) == -1) {
        bValues.push(b);
      }
      colours.push([Math.floor(r), Math.floor(g), Math.floor(b)]);
    }

    let result;
    if (colours.length > 0) {
      let maxChannel;
      let max = Math.max(rValues.length, gValues.length, bValues.length);
      switch (max) {
        case rValues.length:
          maxChannel = 0;
          break;
        case gValues.length:
          maxChannel = 1;
          break;
        default:
          maxChannel = 2;
          break;
      }
      colours = colours.sort((a, b) => {
        return b[maxChannel] - a[maxChannel];
      });
      result = colours[Math.floor(colours.length / 2)];
    } else {
      rAvg = Math.floor(rAvg / count);
      gAvg = Math.floor(gAvg / count);
      bAvg = Math.floor(bAvg / count);
      result = [rAvg, gAvg, bAvg];
    }
    if (isNaN(result[0]) || isNaN(result[1]) || isNaN(result[2])) {
      throw new Error("No colour found.", result);
    }
    canvas.remove();
    imgEl.remove();
    return result;
  }
};
