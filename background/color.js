"use strict";

/* exported Color */

class Color {
  constructor(cssColor) {
    let span = document.createElement("span");
    span.style.color = cssColor;
    cssColor = window.getComputedStyle(span).color;
    if (cssColor == "rgba(0, 0, 0, 0)" || !cssColor) {
      console.log("vivaldifox: toRgb failed with", cssColor);
      this.components = null;
      return;
    }
    let rgb = cssColor.match(/^rgba?\((\d+), (\d+), (\d+)/);
    rgb.shift();
    this.components = rgb.map(x => parseInt(x, 10));
  }

  get textColor() {
    let [r, g, b] = this.components;
    let distanceB = 0, distanceW = 0;

    distanceB = 0.2 * r + g * 0.7 + b * 0.1;
    distanceW = (255 - r) * 0.2 + (255 - g) * 0.7 + (255 - b) * 0.1;

    return distanceB < distanceW ? new Color("#ffffff") : new Color("#000000");
  }
  toString() {
    if (!this.components) {
      return null;
    }
    return "rgb(" + this.components.join(",") + ")";
  }

  static equals(color, color2) {
    return color[0] === color2[0] && color[1] === color2[1]
    && color[2] === color2[2];
  }
}
