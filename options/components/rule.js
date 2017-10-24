function Rule({themes, theme, rule, index}) {
  return React.createElement("div", {}, 
    ThemeSelect({
      themes: themes,
      defaultValue: theme,
      onChange: (value) => {
        let newRules = [...app.state.settings.rules];
        newRules[index][1] = value;
        console.log(newRules, newRules[index])
        app.setState({
          settings: Object.assign(app.state.settings, {
            rules: newRules
          })
        });
      }
    }),
    React.createElement("input", {
      defaultValue: rule,
      onInput: (e) => {
        let newRules = [...app.state.settings.rules];
        newRules[index][0] = e.target.value;
        app.setState({ settings: Object.assign(app.settings, {rules: newRules})});
      }
    })
  );
}