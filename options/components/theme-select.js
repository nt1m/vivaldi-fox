"use strict";

/* exported ThemeSelect */

function ThemeSelect({ themes, onChange, label, defaultValue }) {
  let names = Object.keys(themes).map(t => ({ id: t, label: t }));

  return createElement("div", {},
    label && createElement("label", {}, label),
    createElement("select", { onChange },
      names.map(v => createElement("option", {
        selected: v.label === defaultValue,
        value: v.label,
      }, v.label))
    )
  );
}
