function Setting({ id, type, values, name }) {
  console.log(values);
  switch (type) {
    case "boolean":
      return React.createElement("div", {},
        React.createElement("input", { type: "checkbox" }),
        React.createElement("label", {}, name)
      );
    case "string":
      return React.createElement("div", {},
        React.createElement("select", {},
          values.map(v => React.createElement("option", {}, v.label))
        )
      );
  }
}