"use strict";

/* exported ThemeEditor */

const ThemeProperty = createFactory(class ThemePropertyFactory extends Component {
  componentDidUpdate() {
    this.refs["color-input"].value = this.props.defaultValue;
  }
  render() {
    let {
      label,
      property,
      defaultValue,
      themeName,
    } = this.props;
    return createElement("div", {className: "setting"},
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
  opacityProperty,
  toggable,
}) {
  let { properties, applyPageColors } = theme;
  let applyPageColorsChecked = applyPageColors.includes(backgroundProperty)
    && (!textProperty || applyPageColors.includes(textProperty));
  let useNative = !(properties.colors[backgroundProperty] &&
                    (!textProperty || properties.colors[textProperty])) &&
                    toggable;
  return createElement("div", {className: "card"},
    createElement("h2", {}, sectionName),
    toggable && Checkbox({
      defaultChecked: useNative,
      label: "Use native default",
      onChange: ({target}) => {
        app.actions.setNativeTheme(
          theme.name, backgroundProperty, textProperty, target.checked);
      }
    }),
    createElement("div", { className: useNative && "disabled" },
      ThemeProperty({
        themeName: theme.name,
        label: "Background",
        property: backgroundProperty,
        defaultValue: properties.colors[backgroundProperty]
      }),
      textProperty && ThemeProperty({
        themeName: theme.name,
        label: "Text",
        property: textProperty,
        defaultValue: properties.colors[textProperty]
      }),
      opacityProperty && Slider({
        themeName: theme.name,
        label: "Opacity",
        defaultValue: theme.opacities[opacityProperty],
        onChange({target}) {
          app.actions.setThemeOpacityProperty(theme.name, opacityProperty, target.value);
        }
      }),
      Checkbox({
        defaultChecked: applyPageColorsChecked,
        label: "Apply page colors",
        onChange(e) {
          app.actions.setThemeApplyPageColors(
            theme.name, backgroundProperty, textProperty, e.target.checked);
        }
      })
    )
  );
}

function ThemeEditor(theme, deleteButton) {

  return createElement("div", {className: "theme-editor-container"},
    createElement("input", {
      type: "checkbox",
      className: "theme-editor-expander",
      id: "theme-editor-expander"
    }),
    createElement("label", { htmlFor: "theme-editor-expander"}, "Advanced options"),
    createElement("div", {className: "theme-editor"},
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
        textProperty: "toolbar_text",
        opacityProperty: "toolbar"
      }),
      ThemePropertyGroup({
        sectionName: "Toolbar Fields",
        theme,
        backgroundProperty: "toolbar_field",
        textProperty: "toolbar_field_text",
        opacityProperty: "toolbar_field"
      }),
      ThemePropertyGroup({
        sectionName: "Toolbar field borders",
        theme,
        backgroundProperty: "toolbar_field_border",
        opacityProperty: "toolbar_field_border",
        toggable: true,
      }),
      ThemePropertyGroup({
        sectionName: "Selected tab",
        theme,
        backgroundProperty: "tab_selected",
        textProperty: "tab_text",
        toggable: true,
      }),
      ThemePropertyGroup({
        sectionName: "Selected tab line",
        theme,
        backgroundProperty: "tab_line",
        toggable: true,
      }),
      ThemePropertyGroup({
        sectionName: "Popups",
        theme,
        backgroundProperty: "popup",
        textProperty: "popup_text",
        toggable: true,
      }),
      ThemePropertyGroup({
        sectionName: "Popup Highlight",
        theme,
        backgroundProperty: "popup_highlight",
        textProperty: "popup_highlight_text",
        toggable: true,
      }),
      ThemePropertyGroup({
        sectionName: "Toolbar top separator",
        theme,
        backgroundProperty: "toolbar_top_separator",
        opacityProperty: "toolbar_top_separator",
        toggable: true,
      }),
      ThemePropertyGroup({
        sectionName: "Toolbar bottom separator",
        theme,
        backgroundProperty: "toolbar_bottom_separator",
        opacityProperty: "toolbar_bottom_separator",
        toggable: true,
      }),
      ThemePropertyGroup({
        sectionName: "Toolbar field separator",
        theme,
        backgroundProperty: "toolbar_field_separator",
        opacityProperty: "toolbar_field_separator",
        toggable: true,
      }),
      ThemePropertyGroup({
        sectionName: "Toolbar vertical separator",
        theme,
        backgroundProperty: "toolbar_vertical_separator",
        opacityProperty: "toolbar_vertical_separator",
        toggable: true,
      }),
      deleteButton && createElement("div", {className: "card"},
        createElement("h2", {}, "Danger!"),
        createElement("p", {className: "disabled"}, "This can't be undone!"),
        createElement("button", {
          className: "red",
          onClick: () => app.actions.deleteTheme(theme.name)
        }, "Delete theme")
      )
    )
  )
}
