
function getColorFormat(color) {
  color = color.replace(/\s/g, "");
  if (color.startsWith("#")) {
    return "hex";
  } else if (color.startsWith("rgb") || color.startsWith("rgba")) {
    return "rgb";
  }
  return "hsl";
}
function createFaviconImage(icon) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = icon;
  });
}
function getColorFromImage(imgEl) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let colors = [];
    // This will:
    // - Take the median of a sorted list of colors (excluding shades of gray)
    // - If image only contains shades of gray, it takes the average instead
    let width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth;
    let height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight;
    console.log("in function");
    ctx.drawImage(imgEl, 0, 0);
    console.log("done drawimage", width, height)
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
      colors.push([Math.floor(r), Math.floor(g), Math.floor(b)]);
    }
    console.log("one step further")
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