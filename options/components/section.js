function Section(header, level = 1, ...content) {
  return React.createElement("div", {} ,
    React.createElement("h" + level, {}, header),
    ...content
  );
}