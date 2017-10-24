function Options({ themes, rules }) {
  let tabs = Object.keys(themes).map((theme) => {
    return {
      id: theme,
      label: theme,
      component: BrowserPreview({theme: themes[theme]})
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
  );
}