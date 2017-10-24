function BrowserPreview({ theme }) {
  return React.createElement("div", {
    className: "browser",
    style: {
      "--theme-tabbar-background": theme.colors.accentcolor,
      "--theme-tabbar-color": theme.colors.textcolor,
      "--theme-navbar-background": theme.colors.toolbar,
      "--theme-navbar-color": theme.colors.toolbar_text,
    }
  },
    React.createElement("div", {
      className: "tabbar",
    },
      React.createElement("div", {
        className: "tab selected"
      }, "Tab"),
      React.createElement("div", {
        className: "tab"
      }, "Tab"),
      React.createElement("div", {
        className: "new-tab-button"
      }, " ")
    ),
    React.createElement("div", {
      className: "navbar",
    },
      React.createElement("div", {
        className: "icons",
      })
    )
  )
}