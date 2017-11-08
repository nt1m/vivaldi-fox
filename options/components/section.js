function Section(header, ...content) {
  return React.createElement("section", {className: "card"},
    React.createElement("h1", {}, header),
    ...content
  );
}