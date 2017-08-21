function Section(header, content) {
  return React.createElement("div", {} ,
    React.createElement("h1", {}, header),
    content
  );
}