function ThemeEditor(theme) {
  return createElement("div", {},
    ThemePropertyGroup({
      sectionName: "Frame",
      themeName: theme.name,
      backgroundProperty: "accentcolor",
      textProperty: "textcolor",
    }),
    ThemePropertyGroup({
      sectionName: "Toolbar",
      themeName: theme.name,
      backgroundProperty: "toolbar",
      textProperty: "toolbar_text"
    }),
  )
}
function ThemePropertyGroup({
  themeName,
  textProperty,
  backgroundProperty,
}) {
  return createElement("div", {className: "card"}, 
    ThemeProperty({
      name: "Background",
      property: backgroundProperty
    }),
    ThemeProperty({
      name: "Text",
      property: textProperty
    }),
  );
}
function ThemeProperty({
  name,
  property,
  value,
  setThemeProperty,
}) {
  return createElement("div", {},
    createElement("span", {}, name),
    createElement("input", { type: "color", defaultValue: value })
  );
}