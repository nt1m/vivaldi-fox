function ThemeSelect({ themes, onChange, defaultValue }) {
  console.log(themes, Object.keys(themes).map(t => ({ id: t, label: t })))
  return Setting({
    id: "defaultTheme",
    type: "string",
    values: Object.keys(themes).map(t => ({ id: t, label: t })),
    onChange,
    defaultValue,
  });
}