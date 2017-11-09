"use strict";

/* exported getReadableFavicon */

function createFaviconImage(icon) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = icon;
  });
}

async function getReadableFavicon(faviconUrl) {
  let imgEl;
  try {
    imgEl = await createFaviconImage(faviconUrl);
  } catch (e) {
    return null;
  }
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  // This will:
  // - Take the median of a sorted list of colors (excluding shades of gray)
  // - If image only contains shades of gray, it takes the average instead
  let width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth;
  let height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight;
  // Apply a maximum width/height before drawing the image
  let oldWidth = width;
  width = Math.min(MAX_ICON_SIZE, width);
  height = Math.round((width * height) / oldWidth);

  let borderRadius = width / 8;
  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.lineJoin = "round";
  ctx.lineWidth = borderRadius * 2;
  ctx.strokeRect(
    borderRadius, borderRadius, width - borderRadius * 2, height - borderRadius * 2);
  ctx.fillRect(
    borderRadius, borderRadius, width - borderRadius * 2, height - borderRadius * 2);
  ctx.drawImage(imgEl, 0, 0, width, height);
  try {
    return canvas.toDataURL();
  } catch (e) {
    return null;
  }
}
