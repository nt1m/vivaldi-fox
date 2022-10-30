"use strict";

/* exported Options */

function Options({ settings: {
  themes,
  colorSource,
  defaultTheme,
  nightTheme,
  nightModeStart,
  nightModeEnd,
  whiteBackgroundFavicons,
  pageColorsOnInactive,
  usePageDefinedColors,
}}) {
  let tabs = Object.keys(themes).map((theme) => {
    return {
      id: theme,
      label: theme,
      component: ThemeEditor(themes[theme], Object.keys(themes).length > 1),
    };
  });
  let nightThemeDesc =
    "To disable this feature, choose the same theme as the default theme.";
  let pageColorDesc = "Select where the page color is extracted from:";
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
      createElement("p", { className: "disabled" },
        createElement("span", {}, "Enable from "),
        Input({
          defaultValue: nightModeStart,
          type: "number",
          min: 0,
          max: 23,
          onChange: ({ target }) => {
            app.actions.setNightModeStart(target.value);
          }
        }),
        createElement("span", {}, "h to "),
        Input({
          defaultValue: nightModeEnd,
          type: "number",
          min: 0,
          max: 23,
          onChange: ({ target }) => {
            app.actions.setNightModeEnd(target.value);
          }
        }),
        createElement("span", {}, "h. " + nightThemeDesc),
      ),
      createElement("p", {
        className: "disabled"
      }, ),
      ThemeSelect({
        themes,
        defaultValue: nightTheme,
        onChange: ({ target }) => {
          app.actions.setNightTheme(target.value);
        }
      }),
      createElement("h2", {}, "Page Colors"),
      createElement("p", {
        className: "disabled"
      }, pageColorDesc),
      Checkbox({
        label: "Use colors defined by the web page when available",
        defaultChecked: usePageDefinedColors,
        onChange: ({ target }) => {
          app.actions.setUsePageDefinedColors(target);
        }
      }),
      Select({
        label: "Alternate color source",
        values: [
          {
            label: "Favicon",
            value: "favicon",
          },
          {
            label: "Page header background",
            value: "page-top"
          },
          {
            label: "Page header accent color",
            value: "page-top-accent"
          },
          {
            label: "None",
            value: "none"
          }
        ],
        defaultValue: colorSource,
        onChange: ({ target }) => {
          app.actions.setColorSource(target);
        }
      }),
      Checkbox({
        label: "Enable page colors on inactive windows",
        defaultChecked: pageColorsOnInactive,
        onChange: ({ target }) => {
          app.actions.setPageColorsOnInactive(target.checked);
        }
      }),
      createElement("h2", {}, "Other"),
      Checkbox({
        label: "White background on page icons (experimental, page reload needed)",
        defaultChecked: whiteBackgroundFavicons,
        onChange: ({ target }) => {
          app.actions.setWhiteBackgroundFavicons(target);
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
