class TabManager {
  constructor({ onSelectionChanged, onUpdated }) {
    this.map = new Map();
    chrome.tabs.onActivated.addListener(async function({ tabId }) {
      let tab = await browser.tabs.get(tabId);
      onSelectionChanged(tab);
    });

    chrome.tabs.onUpdated.addListener(async function(tabId) {
      let tab = await browser.tabs.get(tabId);
      await onUpdated(tab);
      if (tab.active) {
        await onSelectionChanged(tab);
      }
    });
  }

  getTabData(tabId) {
    return this.map.get(tabId);
  }

  setTabData(tabId, data) {
    this.map.set(tabId, data);
  }
}