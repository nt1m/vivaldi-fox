function ThemeSelect({ themes, onChange, label, defaultValue }) {
  let names = Object.keys(themes).map(t => ({ id: t, label: t }));

  return React.createElement("div", {},
    label && React.createElement("label", {}, label),
    React.createElement("select", { onChange },
      names.map(v => React.createElement("option", {
        selected: v.label === defaultValue,
        value: v.label,
      }, v.label))
    )
  );
}