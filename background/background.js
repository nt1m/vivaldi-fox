var currentTheme, tabManager;
async function init() {
  const themes = await Settings.get("themes");
  currentTheme = new Theme(themes.default);

  tabManager = new TabManager({
    onSelectionChanged: async (tab) => {
      t = await RuleManager.getCurrent(tab);
      currentTheme = new Theme(t);
      if (!tabManager.map.has(tab.id)) {
        await setColorHeuristic(tab);
      }
      await applyColorFromMap(tab.id);
    },
    onUpdated: async (tab) => {
      t = await RuleManager.getCurrent(tab);
      currentTheme = new Theme(t);
      await setColorHeuristic(tab);
    }
  });

  Settings.onChanged(() => {
    currentTheme = new Theme(themes[0]);
  });
}

window.onload = init;

async function setColorHeuristic(tab) {
  if (currentTheme.applyPageColor.length <= 0) {
    return;
  }
  // may fail on privileged webpages.
  try {
    let [foundPageColor] = await browser.tabs.executeScript(tab.id, { file: "data/contentscript.js"})
    if (foundPageColor) {
      updateColorMap(tab.id, new Color(foundPageColor));
      return;
    }
  } catch(e) {}

  if (tab.favIconUrl) {
    let img = await createFaviconImage(tab.favIconUrl);
    let color = getColorFromImage(img);
    updateColorMap(tab.id, color);
    return;
  }

  updateColorMap(tab.id, "default");
}


async function applyColorFromMap(tabId) {
  if (currentTheme.applyPageColor.length <= 0) {
    return;
  }
  var colorMap = tabManager.map;

  if (!colorMap.has(tabId)) {
    return;
  }
  console.log("applying color", colorMap.get(tabId));
  if (colorMap.get(tabId) == "default") {
    currentTheme.reset();
  } else {
    currentTheme.patch({
      colors: {
        accentcolor: colorMap.get(tabId).toString(),
        textcolor: colorMap.get(tabId).textColor.toString()
      }
    });
    console.log("color applied", colorMap.get(tabId));
  }
}

async function updateColorMap(tabId, value) {
  tabManager.map.set(tabId, value);
}

