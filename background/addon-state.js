class AddonState {
  constructor({ onTabColorChange, onSettingChange, onInit }) {
    this.state = {
      tabColorMap: new Map(),
    };
  
    onTabColorChange = onTabColorChange.bind(this);
    onInit = onInit.bind(this);

    browser.tabs.onActivated.addListener(async ({ tabId }) => {
      let {tabColorMap} = this.state;
      let tab = await browser.tabs.get(tabId);

      if (!tabColorMap.has(tabId)) {
        tabColorMap.set(tabId, await findColor(tab));
      }
      onTabColorChange(tab);
    });

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (!changeInfo.url && !changeInfo.favIconUrl) {
        return;
      }
      let color = await findColor(tab);
      let {tabColorMap} = this.state;      

      if (color && tabColorMap.get(tab.id) !== null && Color.equals(color, tabColorMap.get(tab.id))) {
        // Don't bother changing the theme if color is still the same.
        return;
      }

      tabColorMap.set(tabId, color);

      if (tab.active) {
        await onTabColorChange(tab);
      }
    });
    
    onInit();
  }
}

async function findColor(tab) {
  try {
    let [foundPageColor] = await browser.tabs.executeScript(tab.id, { file: "data/contentscript.js"})
    if (foundPageColor) {
      return new Color(foundPageColor);
    }
  } catch(e) {}

  if (tab.favIconUrl) {
    let img = await createFaviconImage(tab.favIconUrl);
    let color = getColorFromImage(img);
    return color;
  }
  return null;
}