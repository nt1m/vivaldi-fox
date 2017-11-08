function ThemeSelect({ themes, onChange, setting, label, defaultValue }) {
  return Setting({
    type: "string",
    setting,
    label,
    defaultValue,
    values: Object.keys(themes).map(t => ({ id: t, label: t })),
    onChange,
  });
}