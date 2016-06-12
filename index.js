const self = require("sdk/self");
const tabs = require("sdk/tabs");
const windowUtils = require("sdk/window/utils");
const ColourManager = {
  tabColourMap: new Map(),
  injectStyleSheetToWindow() {
    let win = windowUtils.getMostRecentBrowserWindow();
    let styleEl = win.document.createElementNS("http://www.w3.org/1999/xhtml","link");
    styleEl.rel = "stylesheet";
    styleEl.href = self.data.url("browser.css");
    win.document.documentElement.appendChild(styleEl);
  },
  putColourInMap(tab, colour, applyIfSelected = true) {
    this.tabColourMap.set(tab.id, colour);
    if (tab == tabs.activeTab && applyIfSelected) {
      this.onTabChange(tab);
    }
  },
  onTabChange(tab) {
    if (!this.tabColourMap.has(tab.id)) {
      this.onNewURL(tab);
    } else if (this.tabColourMap.get(tab.id) == "default") {
      ColourManager.resetColours();
    } else {
      ColourManager.setColour(this.tabColourMap.get(tab.id));
    }
  },
  onTabRemove(tab) {
    this.tabColourMap.delete(tab.id);
  },
  onNewURL(tab) {
    var worker = tab.attach({
      contentScriptFile: self.data.url("content-script.js")
    });
    worker.port.once("theme-colour-change", (data) => {
      if (data == "default") {
        this.putColourInMap(tab, "default", false);
        return ColourManager.getColourFromFavicon().then((colour) => {
          this.putColourInMap(tab, "rgb(" + colour.join(",") + ")");
          console.log("PUT COLOUR IN MAP AFTER FETCHING IT", colour)
        });
      }
      this.putColourInMap(tab, data);
    });
  },
  resetColours() {
    let win = windowUtils.getMostRecentBrowserWindow();
    let doc = win.document;
    doc.documentElement.style.removeProperty("--theme-background");
    doc.documentElement.style.removeProperty("--theme-colour");
  },
  getColourFromFavicon() {
    return new Promise((resolve, reject) => {
      let win = windowUtils.getMostRecentBrowserWindow();
      let doc = win.document;
      let canvas = doc.createElementNS("http://www.w3.org/1999/xhtml","canvas");
      let ctx = canvas.getContext("2d");
      let { getFavicon } = require("sdk/places/favicon");

      getFavicon(tabs.activeTab.url).then(function(url) {
        if (!url) reject();
        let imgEl = doc.createElementNS("http://www.w3.org/1999/xhtml","img");
        let colours = [];
        imgEl.src = url;
        imgEl.onload = function() {
          let height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
          let width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
          ctx.drawImage(imgEl, 0, 0);
          let data = ctx.getImageData(0, 0, width, height).data;
          //console.log(data, height, width)
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
            if (r == 0 && g == 0 && b == 0 && a == 0) continue;
            if (rValues.indexOf(r) == -1) {
              rValues.push(r);
            }
            if (gValues.indexOf(g) == -1) {
              gValues.push(g);
            }
            if (bValues.indexOf(b) == -1) {
              bValues.push(b);
            }
            colours.push([r, g, b]);
            count++;
          }
          let maxChannel;
          let max = Math.max(rValues.length, gValues.length, bValues.length);
          switch (max) {
            case rValues.length:
              maxChannel = 0;
            case gValues.length:
              maxChannel = 1;
            default:
              maxChannel = 2;
          }
          colours = colours.sort((a, b) => {
            return b[maxChannel] - a[maxChannel];
          });
          // rAvg = Math.floor(rAvg/count);
          // gAvg = Math.floor(gAvg/count);
          // bAvg = Math.floor(bAvg/count);
          // console.log(rAvg,gAvg,bAvg)
          canvas.remove();
          imgEl.remove();
          resolve(colours[Math.floor(colours.length / 2)])
        };
      });
    });
  },
  setColour(colour) {
    console.log(colour);
    let win = windowUtils.getMostRecentBrowserWindow();
    let doc = win.document;
    doc.documentElement.style.setProperty("--theme-background", colour);
    let navbar = doc.querySelector("#nav-bar")
    let color = win.getComputedStyle(navbar).getPropertyValue("background-color");
    let isAlpha = color.startsWith("rgba");
    let [r, g, b] = color.split(",");
    r = isAlpha ? r.substring(5, r.length) : r.substring(4, r.length);
    b = isAlpha ? b : b.substring(0, r.length - 1);
    let luminance = 0.2125 * r + 0.7154 * g + 0.0721 * b;
    console.log(luminance);
    if (luminance > 110) { // was 110
      doc.documentElement.style.removeProperty("--theme-colour");
    } else {
      doc.documentElement.style.setProperty("--theme-colour", "#fff");
    }
    win.ToolbarIconColor.inferFromText();
  },
  init() {
    this.onTabRemove = this.onTabRemove.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.onNewURL = this.onNewURL.bind(this);
    this.injectStyleSheetToWindow();
  }
}
ColourManager.init();

tabs.on("close", ColourManager.onTabRemove);
tabs.on("activate", () => ColourManager.onTabChange(tabs.activeTab));
tabs.on("deactivate", () => ColourManager.onTabChange(tabs.activeTab));
tabs.on("ready", ColourManager.onNewURL);