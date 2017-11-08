function Options({ settings: {themes} }) {
  let tabs = Object.keys(themes).map((theme) => {
    return {
      id: theme,
      label: theme,
      component: ThemeEditor(themes[theme]),
    }
  });
  return React.createElement("div", {},
    Section("Themes", 1,
      Tabs({
        selectedTab: app.state.selectedTab,
        tabs
      })
    ),
    Section("Default Theme", 1,
      ThemeSelect({
        themes,
        onChange: () => {

        }
      })
    ),
    Section("Night mode", 1,
      Setting({
        type: "boolean",
        setting: "nightModeEnabled",
        label: "Enable night mode",
        value: "",
      }),
      ThemeSelect({
        label: "Night mode theme",
        themes,
        onChange: () => {
          
        }
      })
    ),
  );
}