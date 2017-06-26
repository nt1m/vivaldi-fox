function Options({ themes }) {
  console.log(themes);
  return React.createElement("div", {},
    BrowserPreview({theme: themes[0]})
  )
}