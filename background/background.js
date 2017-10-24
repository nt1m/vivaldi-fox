var currentTheme, tabManager;

async function resetTheme() {
  let theme = await RuleManager.getCurrent();
  currentTheme = new Theme(theme);
}

async function init() {
  const themes = await Settings.get("themes");
  await resetTheme();

  tabManager = new TabManager({
    onSelectionChanged: async (tab) => {
      if (!tabManager.map.has(tab.id)) {
        await findColor(tab);
      }
      await applyColor(tab.id, tab.windowId);
    },
    onUpdated: async (tab, changeInfo) => {
      if (!changeInfo.url && !changeInfo.favIconUrl) {
        return;
      }
      await resetTheme();
      await findColor(tab);
      await applyColor(tab);
    }
  });

  Settings.onChanged(() => {
    currentTheme = new Theme(themes[0]);
  });
}

window.onload = init;

async function findColor(tab) {
  // if (currentTheme.applyPageColor.length <= 0) {
  //   return;
  // }
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
  return;
}


async function applyColor(tabId, windowId) {
  // if (currentTheme.applyPageColor.length <= 0) {
  //   return;
  // }
  var colorMap = tabManager.map;

  console.log("applying color", colorMap.get(tabId));
  if (colorMap.get(tabId) == "default" || !colorMap.has(tabId)) {
    currentTheme.reset(windowId);
  } else {
    currentTheme.patch({
      colors: {
        toolbar: colorMap.get(tabId).toString(),
        toolbar_text: colorMap.get(tabId).textColor.toString()
      }
    }, windowId);
    console.log("color applied", colorMap.get(tabId));
  }
}

async function updateColorMap(tabId, value) {
  tabManager.map.set(tabId, value);
}

