"use strict";

/* exported Options */

function Options({ settings: {themes, defaultTheme, nightTheme} }) {
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
    Section("Selected Themes",
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
