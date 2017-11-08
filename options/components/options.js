function Options({ settings: {themes, defaultTheme} }) {
  let tabs = Object.keys(themes).map((theme) => {
    return {
      id: theme,
      label: theme,
      component: ThemeEditor(themes[theme], Object.keys(themes).length > 1),
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
        defaultValue: defaultTheme,
        onChange: ({target}) => {
          app.actions.setDefaultTheme(target.value);
        }
      })
    ),
    Section("Night mode", 1,
      ThemeSelect({
        label: "Night mode theme",
        themes,
        onChange: () => {
          app.actions.setNightTheme(target.value);
        }
      })
    ),
  );
}