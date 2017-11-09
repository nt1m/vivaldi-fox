"use strict";

/* exported AddonState */

class AddonState {
  constructor({ onTabColorChange, onFaviconChange, onNightMode, onInit }) {
    this.state = {
      tabColorMap: new Map(),
    };

    onTabColorChange = onTabColorChange.bind(this);
    onNightMode = onNightMode.bind(this);
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
      if (changeInfo.favIconUrl && !changeInfo.favIconUrl.startsWith("data:")) {
        onFaviconChange(tab);
      }
      if (!changeInfo.url && !changeInfo.favIconUrl) {
        return;
      }
      let color = await findColor(tab);
      let {tabColorMap} = this.state;

      tabColorMap.set(tabId, color);

      if (tab.active) {
        await onTabColorChange(tab);
      }
    });

    this.refreshAddon = async () => {
      onInit();

      await new Promise(r => setTimeout(r, 500));
      let tabs = await browser.tabs.query({ active: true });
      if (tabs.length == 0) {
        return;
      }
      for (let tab of tabs) {
        onTabColorChange(tab);
      }
    };

    Settings.onChanged(this.refreshAddon);

    browser.alarms.create(
      "nightToggle",
      {
        when: firstAlarm(),
        periodInMinutes: 12 * 60, // 12 hours
      }
    );
    browser.alarms.onAlarm.addListener(({name}) => {
      if (name === "nightToggle") {
        onNightMode();
      }
    });
    onInit();
  }
}

function firstAlarm() {
  let now = new Date(Date.now());
  let then = new Date(Date.now());
  if (now.getHours() >= NIGHTMODE_EVENING) {
    then.setHours(24 + NIGHTMODE_MORNING);
  } else if (now.getHours() < NIGHTMODE_MORNING) {
    then.setHours(NIGHTMODE_MORNING);
  } else {
    then.setHours(NIGHTMODE_EVENING);
  }
  then.setMinutes(0);
  then.setSeconds(0);
  return then.getTime();
}
