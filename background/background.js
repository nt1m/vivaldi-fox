var currentTheme = new Theme({
  images: {
    headerURL: ""
  },
  colors: {
    accentcolor: "#ffffff",
    textcolor: "#000000"
  }
});
var colorMap = new Map();
chrome.tabs.onActivated.addListener(function({tabId}) {
  console.log("tabActivated", tabId);
  applyColorFromMap(tabId);
});

// chrome.tabs.onUpdated.addListener(function(tabId) {
//   updateColorMap(tabId);
// });

async function applyColorFromMap(tabId) {
  console.log(colorMap)
  if (!colorMap.has(tabId)) {
    await updateColorMap(tabId);
  }
  console.log("applying color", colorMap.get(tabId));
  if (colorMap.get(tabId) == "default") {
    currentTheme.reset();
  } else {
    currentTheme.patch({
      colors: {
        accentcolor: colorMap.get(tabId),
      }
    });
    console.log("color applied", colorMap.get(tabId));
  }
}

async function updateColorMap(tabId, value) {
  if (value == "default") {
    colorMap.set(tabId, "default");
  }
  if (!value) {
    try {
    let tab = await browser.tabs.get(tabId);
    console.log(tab);
    let img = await createFaviconImage(tab.favIconUrl);
    console.log(img);
    colorMap.set(tabId, getColorFromImage(img));
    console.log(colorMap, tabId)
    return;
    } catch(e) {console.error(e)}
  }
  let color = toRgb(value);

  colorMap.set(tabId, "rgb(" + color.join(",") + ")");
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("received", message, sender);
  if (!sender.tab) return false;
  updateColorMap(sender.tab.id, message.content);
  applyColorFromMap(sender.tab.id);
});

