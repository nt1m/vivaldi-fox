"use strict";

/* exported Options */

function Options({ settings: {
  themes,
  defaultTheme,
  nightTheme,
  whiteBackgroundFavicons,
  pageColorsOnInactive,
}}) {
  let tabs = Object.keys(themes).map((theme) => {
    return {
      id: theme,
      label: theme,
      component: ThemeEditor(themes[theme], Object.keys(themes).length > 1),
    };
  });
  let nightThemeDesc = "The night theme is enabled from 8pm to 8am. " +
    "To disable this feature, choose the same theme as the default theme.";

  return createElement("div", {},
    Section("General settings",
      createElement("h2", {}, "Default theme"),
      ThemeSelect({
        themes,
        defaultValue: defaultTheme,
        onChange: ({target}) => {
          app.actions.setDefaultTheme(target.value);
        }
      }),
      createElement("h2", {}, "Night theme"),
      createElement("p", {
        className: "disabled"
      }, nightThemeDesc),
      ThemeSelect({
        themes,
        defaultValue: nightTheme,
        onChange: ({target}) => {
          app.actions.setNightTheme(target.value);
        }
      }),
      createElement("h2", {}, "Other settings"),
      Checkbox({
        label: "Enable page colors on inactive windows",
        defaultChecked: pageColorsOnInactive,
        onChange: ({ target }) => {
          app.actions.setPageColorsOnInactive(target.checked);
        }
      }),
      Checkbox({
        label: "White background on page icons (experimental)",
        defaultChecked: whiteBackgroundFavicons,
        onChange: ({ target }) => {
          app.actions.setWhiteBackgroundFavicons(target.checked);
        }
      })
    ),

    Section("Themes",
      Tabs({
        selectedTab: app.state.selectedTab,
        tabs
      })
    ),
  );
}
