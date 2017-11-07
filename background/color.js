class Color {
  constructor(color) {
    try {
      color = color.replace(/\s/g, "");
      let r, g, b;
      if (getColorFormat(color) == "hex") {
        if (color.length == 4) {
          color = "#" + color[1].repeat(2) + color[2].repeat(2) + color[3].repeat(2);
        }
        r = "0x" + color[1] + color[2];
        g = "0x" + color[3] + color[4];
        b = "0x" + color[5] + color[6];
      } else {
        let isAlpha = color.startsWith("rgba");
        ([r, g, b] = color.split(","));
        r = isAlpha ? r.substring(5, r.length) : r.substring(4, r.length);
        b = isAlpha ? b : b.substring(0, b.length - 1);
      }
      this.components = [Math.floor(Number(r)), Math.floor(Number(g)), Math.floor(Number(b))];
    } catch (e) {
      console.log("vivaldifox: toRgb failed with", color);
      this.components = [255,255,255];
    }
  }

  get textColor() {
    let [r, g, b] = this.components;
    let distanceB = 0, distanceW = 0;
    
    distanceB = 0.2 * r + g * 0.7 + b * 0.1;
    distanceW = (255 - r) * 0.2 + (255 - g) * 0.7 + (255 - b) * 0.1;
    
    return distanceB < distanceW ? new Color("#ffffff") : new Color("#000000");
  }
  toString() {
    return "rgb(" + this.components.join(",") + ")";
  }

  static equals(color, color2) {
    return color[0] === color2[0] && color[1] === color2[1]
    && color[2] === colors2[2];
  }
}