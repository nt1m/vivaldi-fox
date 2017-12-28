"use strict";

/* exported LOG, NIGHTMODE_MORNING, NIGHTMODE_EVENING, MAX_PIXELS */

// Night mode bounds
const NIGHTMODE_MORNING = 8;
const NIGHTMODE_EVENING = 20;

// Maximum number of pixels that the browser can process
const MAX_PIXELS = 100000;

function LOG(...args) {
  console.log("vivaldifox", ...args);
}
