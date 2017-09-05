function Rule({themes, theme, rule}) {
  return React.createElement("div", {}, 
    ThemeSelect({
      themes: themes,
      defaultValue: theme,
      onChange: () => {

      }
    }),
    React.createElement("input", {
      defaultValue: rule,
    })
  );
}