function Options({ themes }) {
  let tabs = Object.keys(themes).map((theme) => {
    return {
      id: theme,
      label: theme,
      component: BrowserPreview({theme: themes[theme]})
    }
  });
  return React.createElement("div", {},
    Section("Themes", 
      Tabs({
        selectedTab: app.state.selectedTab,
        tabs
      })
    ),
    Section("Default Theme"),
    Section("Theming rules")
  );
}