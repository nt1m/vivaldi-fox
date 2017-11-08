function ThemeSelect({ themes, onChange, setting, label }) {
  return Setting({
    type: "string",
    setting,
    label,
    values: Object.keys(themes).map(t => ({ id: t, label: t })),
    onChange: () => {
      
    }
  });
}