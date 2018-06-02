"use strict";

/* exported AddonState */

class AddonState {
  constructor({
    onTabColorChange,
    onFaviconChange,
    onWindowFocusChange,
    onNightMode,
    onInit
  }) {
    this.state = {
      tabColorMap: new Map(),
    };

    onTabColorChange = onTabColorChange.bind(this);
    onWindowFocusChange = onWindowFocusChange.bind(this);
    onNightMode = onNightMode.bind(this);
    onInit = onInit.bind(this);

    browser.runtime.onMessage.addListener(async (message, {tab}) => {
      let usePageDefinedColors = await Settings.getUsePageDefinedColors();
      let hasPageDefinedColor = false;

      let color = false;

      if (usePageDefinedColors) {
        if (message.command === "color") {
          color = new Color(message.value);
          hasPageDefinedColor = true;
        } else if (message.command === "reset") {
          color = false;
        }
      }

      if (!hasPageDefinedColor) {
        let baseColor = await findBaseColor(tab);
        if (baseColor) {
          color = new Color(baseColor);
        }
      }

      this.state.tabColorMap.set(tab.id, color);

      if (tab.active) {
        onTabColorChange(tab);
      }
    });

    browser.tabs.onActivated.addListener(async ({ tabId }) => {
      let tab = await browser.tabs.get(tabId);

      onTabColorChange(tab);
    });

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      let faviconChanged = tab.favIconUrl && !tab.favIconUrl.startsWith("data:");
      if (faviconChanged) {
        onFaviconChange(tab);
      }

      try {
        // await browser.tabs.sendMessage(tabId, {hi: "hi"});
        await browser.tabs.executeScript(tabId, {code: "'hi';"});
      } catch (e) {
        let color = false;
        let baseColor = await findBaseColor(tab);
        if (baseColor) {
          color = new Color(baseColor);
        }
        this.state.tabColorMap.set(tab.id, color);
        if (tab.active) {
          onTabColorChange(tab);
        }
      }
    });

    browser.tabs.onRemoved.addListener((tabId) =>
      this.state.tabColorMap.delete(tabId));

    this.refreshAddon = async () => {
      onInit();

      browser.alarms.create(
        "nightToggle", { when: (await firstAlarm()) }
      );

      await new Promise(r => setTimeout(r, 400));

      let tabs = await browser.tabs.query({ active: true });
      if (tabs.length == 0) {
        return;
      }
      for (let tab of tabs) {
        if (tab.active) {
          let color = await findBaseColor(tab);
          this.state.tabColorMap.set(tab.id, color);
        }
        onTabColorChange(tab);
      }
    };

    Settings.onChanged(this.refreshAddon);
    browser.windows.onFocusChanged.addListener(onWindowFocusChange);

    (async () => {
      browser.alarms.create(
        "nightToggle", { when: (await firstAlarm()) }
      );
    })();
    browser.alarms.onAlarm.addListener(async ({name}) => {
      if (name === "nightToggle") {
        onNightMode();
        browser.alarms.create(
          "nightToggle", { when: (await firstAlarm()) }
        );
      }
    });
    onInit();
  }
}

async function firstAlarm() {
  let now = new Date(Date.now());
  let then = new Date(Date.now());
  let nightModeStart = await Settings.getNightModeStart();
  let nightModeEnd = await Settings.getNightModeEnd();

  if (nightModeStart > nightModeEnd) {
    if (now.getHours() >= nightModeStart) {
      then.setHours(24 + nightModeEnd);
    } else if (now.getHours() < nightModeEnd) {
      then.setHours(nightModeEnd);
    } else {
      then.setHours(nightModeStart);
    }
  } else {
    if (now.getHours() >= nightModeEnd) {
      then.setHours(24 + nightModeStart);
    } else if (now.getHours() < nightModeStart) {
      then.setHours(nightModeStart);
    } else {
      then.setHours(nightModeEnd);
    }
  }
  then.setMinutes(0);
  then.setSeconds(0);
  return then.getTime();
}
