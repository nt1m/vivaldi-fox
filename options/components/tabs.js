"use strict";

/* exported Tabs */
/* eslint-disable indent */

function Tabs({ tabs, selectedTab }) {
  let selected = tabs.find(t => t.id == selectedTab);
  return createElement("div", {},
    createElement("ul", {
      className: "tabs"
    },
      ...tabs.map(t => createElement("li", {
        className: selectedTab == t.id ? "selected" : null,
      },
        createElement("a", {
          href: "#",
          onClick(e) {
            app.setState({ selectedTab: t.id });
            e.preventDefault();
          }
        }, createElement("span", {}, t.label))
      )),
      createElement("button", {
        className: "addButton",
        onClick() {
          app.actions.addTheme();
        }
      })
    ),
    createElement("div", { className: "tab-panel" },
      selected.component
    )
  );
}
