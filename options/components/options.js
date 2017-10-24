function Options({ settings }) {
  let { themes, rules } = settings;
  let ruleIndex = 0;
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
        themes
      })
    ),
    Section("Theme rules", 1,
      Section("Presets", 2,
      ),
      Section("Advanced", 2,
        ...rules.map(r => Rule({rule: r[1], themes, theme: r[0], index: ruleIndex++}))
      )
    )
  );
}