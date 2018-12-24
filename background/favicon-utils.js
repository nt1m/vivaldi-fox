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

function imageMostlyTransparent(imgEl) {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let width = imgEl.naturalWidth || imgEl.offsetWidth;
  let height = imgEl.naturalHeight || imgEl.offsetHeight;
  // Apply a maximum width/height before drawing the image
  let oldWidth = width;
  let oldHeight = height;
  width = Math.min(MAX_PIXELS / oldHeight, width);
  height = Math.round((width * oldHeight) / oldWidth);

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(imgEl, 0, 0, oldWidth, oldHeight, 0, 0, width, height);

  let data = ctx.getImageData(0, 0, width, height).data;
  let transparent = 0;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) {
      transparent++;
    }
  }
  return (transparent / (data.length / 4)) > 0.25; // 25% transparent pixels or more
}

async function getReadableFavicon(faviconUrl) {
  let imgEl;
  try {
    imgEl = await createImageFromUrl(faviconUrl);
  } catch (e) {
    console.log(favIconUrl, "failed loading")
    return null;
  }

  if (!imageMostlyTransparent(imgEl)) {
    return;
  }
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth;
  let height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight;
  // Apply a maximum width/height before drawing the image
  let oldWidth = width;
  width = Math.min(MAX_PIXELS / height, width);
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
