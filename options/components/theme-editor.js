ThemeProperty = React.createFactory(class ThemePropertyFactory extends React.Component {
  componentDidUpdate() {
    this.refs["color-input"].value = this.props.defaultValue;
  }
  render() {
    let {
      label,
      property,
      defaultValue,
      setThemeProperty,
    } = this.props;
    return createElement("div", {},
      createElement("span", {}, label),
      createElement("input", { type: "color", ref: "color-input", defaultValue })
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
      label: "Background",
      property: backgroundProperty,
      defaultValue: theme.properties.colors[backgroundProperty]
    }),
    ThemeProperty({
      label: "Text",
      property: textProperty,
      defaultValue: theme.properties.colors[textProperty]
    }),
  );
}

function ThemeEditor(theme) {
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
  )
}
