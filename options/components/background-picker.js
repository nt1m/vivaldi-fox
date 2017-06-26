function BackgroundPicker({ value, images = false, multipleBackgrounds = false }) {
  return React.createElement("div", {},
    images && React.createElement("div", {
      
    }),
    multipleBackgrounds && React.createElement("div", {
      
    }),
    React.createElement("input", {
      type: "color",
      defaultValue: value,
    })
  )
}