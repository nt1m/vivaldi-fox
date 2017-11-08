function Tabs({ tabs, selectedTab }) {
  let selected = tabs.find(t => t.id == selectedTab);
  return React.createElement("div", {},
    React.createElement("ul", {
      className: "tabs"
    },
      ...tabs.map(t => React.createElement("li", {
        className: selectedTab == t.id ? "selected" : null,
      },
        React.createElement("a", {
          href: "#",
          onClick(e) {
            app.setState({ selectedTab: t.id });
            e.preventDefault();
          }
        }, 
          React.createElement("span", {}, t.label),
          t.hasOwnProperty("badge") && React.createElement("span", { className: "badge" }, t.badge)
        )
      )),
      createElement("button", {
        className: "addButton",
        onClick() {
          app.actions.addTheme();
        }
      }, "+")
    ),
    React.createElement("div", { className: "tab-panel" },
      selected.component
    )
  )
}