"use strict";

/* exported getReadableFavicon */

function createImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function getReadableFavicon(faviconUrl) {
  let imgEl;
  try {
    imgEl = await createImageFromUrl(faviconUrl);
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

  let scaleFactor = 0.875;
  let offsetFactor = ((1 - scaleFactor) / 2);

  ctx.drawImage(
    imgEl, 0, 0, width, height,
    offsetFactor * width, offsetFactor * height,
    width * scaleFactor, height * scaleFactor
  );
  try {
    return canvas.toDataURL();
  } catch (e) {
    return null;
  }
}
