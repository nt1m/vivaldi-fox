"use strict";

(function() {
  const setColor = (color) => {
    browser.runtime.sendMessage({
      command: "color",
      value: color
    });
    return true;
  };
  const resetColor = () => {
    browser.runtime.sendMessage({
      command: "reset"
    });
  };
  const getManifestColor = async () => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      try {
        const manifest = await fetch(manifestLink.href);
        if (manifest.ok) {
          const json = await manifest.json();
          if (json.hasOwnProperty("theme_color")) {
            return setColor(json.theme_color);
          }
          if (json.hasOwnProperty("background_color")) {
            return setColor(json.background_color);
          }
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  };
  const getMeta = (name, callback) => {
    const meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) {
      callback(meta.content);
      // const obs = new MutationObserver(() => {
      //   cbk(meta.content);
      // });
      // obs.observe(meta, {
      //   attributes: true
      // });
      return true;
    }
    return false;
  };
  const getThemeColor = () => {
    return getMeta("theme-color", setColor);
  };
  const getMSTileColor = () => {
    return getMeta("msapplication-TileColor", setColor);
  };
  const getBrowserConfig = async () => {
    const msappConfig = document.querySelector('meta[name="msapplication-config"]');
    if (msappConfig) {
      try {
        const browserConfig = await fetch(msappConfig.content);
        if (browserConfig.ok) {
          const text = await browserConfig.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "application/xml");
          const color = doc.querySelector("TileColor");
          if (color) {
            return setColor(color.textContent);
          }
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  };
  const getStatusBarStyle = () => {
    return getMeta("apple-mobile-web-app-status-bar-style", (style) => {
      if (style.startsWith("black")) {
        return setColor("#000000");
      }
      return resetColor();
    });
  };

  const getColor = async () => {
    if (await getManifestColor()) {
      return;
    }
    if (getThemeColor()) {
      return;
    }
    if (getMSTileColor()) {
      return;
    }
    if (await getBrowserConfig()) {
      return;
    }
    if (getStatusBarStyle()) {
      return;
    }
    resetColor();
  };

  getColor();
})();
