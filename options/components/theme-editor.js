const ThemeProperty = React.createFactory(class ThemePropertyFactory extends React.Component {
  componentDidUpdate() {
    this.refs["color-input"].value = this.props.defaultValue;
  }
  render() {
    let {
      label,
      property,
      defaultValue,
      setThemeProperty,
      themeName,
    } = this.props;
    return createElement("div", {},
      createElement("span", {}, label),
      createElement("input", {
        type: "color",
        ref: "color-input",
        defaultValue,
        onInput: ({target}) => {
          app.actions.setThemeProperty(themeName, "colors", property, target.value);
        }
      })
    );
  }
});

function ThemePropertyGroup({
  sectionName,
  theme,
  textProperty,
  backgroundProperty,
}) {
  return createElement("div", {className: "card"},
    createElement("h2", {}, sectionName),
    ThemeProperty({
      themeName: theme.name,
      label: "Background",
      property: backgroundProperty,
      defaultValue: theme.properties.colors[backgroundProperty]
    }),
    ThemeProperty({
      themeName: theme.name,
      label: "Text",
      property: textProperty,
      defaultValue: theme.properties.colors[textProperty]
    }),
  );
}

function ThemeEditor(theme, deleteButton) {
  return createElement("div", {className: theme.name},
    ThemePropertyGroup({
      sectionName: "Frame",
      theme,
      backgroundProperty: "accentcolor",
      textProperty: "textcolor",
    }),
    ThemePropertyGroup({
      sectionName: "Toolbar",
      theme,
      backgroundProperty: "toolbar",
      textProperty: "toolbar_text"
    }),
    ThemePropertyGroup({
      sectionName: "Toolbar Fields",
      theme,
      backgroundProperty: "toolbar_field",
      textProperty: "toolbar_field_text"
    }),
    deleteButton && createElement("button", {
      onClick: () => app.actions.deleteTheme(theme.name)
    }, "Delete theme")
  )
}
