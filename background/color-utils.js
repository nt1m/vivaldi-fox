"use strict";

/* exported getColorFormat, findColor */

function getColorFormat(color) {
  color = color.replace(/\s/g, "");
  if (color.startsWith("#")) {
    return "hex";
  } else if (color.startsWith("rgb") || color.startsWith("rgba")) {
    return "rgb";
  }
  return "hsl";
}

function getColorFromImage(imgEl, ignoreGrey, yCrop) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");

  // This will:
  // - Take the median of a sorted list of colors (excluding shades of gray)
  // - If image only contains shades of gray, it takes the average instead
  let width = imgEl.naturalWidth || imgEl.offsetWidth;
  let height = yCrop || imgEl.naturalHeight || imgEl.offsetHeight;
  // Apply a maximum width/height before drawing the image
  let oldWidth = width;
  let oldHeight = height;
  width = Math.min(MAX_PIXELS / oldHeight, width);
  height = Math.round((width * oldHeight) / oldWidth);

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(imgEl, 0, 0, oldWidth, oldHeight, 0, 0, width, height);

  let colors = [];
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
    if (r == g && g == b && ignoreGrey) {
      continue;
    }
    if (!rValues.includes(r)) {
      rValues.push(r);
    }
    if (!gValues.includes(g)) {
      gValues.push(g);
    }
    if (!bValues.includes(b)) {
      bValues.push(b);
    }
    colors.push([Math.floor(r), Math.floor(g), Math.floor(b)]);
  }

  let result;
  if (colors.length > 0) {
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
    colors = colors.sort((a, b) => {
      return b[maxChannel] - a[maxChannel];
    });
    result = colors[Math.floor(colors.length / 2)];
  } else {
    rAvg = Math.floor(rAvg / count);
    gAvg = Math.floor(gAvg / count);
    bAvg = Math.floor(bAvg / count);
    result = [rAvg, gAvg, bAvg];
  }
  if (isNaN(result[0]) || isNaN(result[1]) || isNaN(result[2])) {
    throw new Error("No color found.", result);
  }
  canvas.remove();
  return new Color("rgb(" + result.join(",") + ")");
}

async function findColor(tab) {
  if (await Settings.getUseMetaTag()) {
    try {
      let [foundPageColor] = await browser.tabs.executeScript(tab.id, {
        file: "data/contentscript.js"
      });
      if (foundPageColor) {
        let color = new Color(foundPageColor);
        return color;
      }
    } catch (e) {}
  }

  let colorSource = await Settings.getColorSource();

  let url, yCrop = false, ignoreGrey = true;
  switch (colorSource) {
    case "favicon": {
      url = tab.favIconUrl;
      break;
    }
    case "page-top": {
      url = await browser.tabs.captureVisibleTab();
      yCrop = 3;
      ignoreGrey = false;
      break;
    }
    case "page-top-accent": {
      url = await browser.tabs.captureVisibleTab();
      yCrop = 200;
      ignoreGrey = true;
    }
  }

  if (url) {
    let img = await createImageFromUrl(url);
    let color = getColorFromImage(img, ignoreGrey, yCrop);
    return color;
  }

  return null;
}
