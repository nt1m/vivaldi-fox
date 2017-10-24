let Setting = React.createFactory(React.createClass({
  async componentDidMount() {
    if (this.refs.formControl) {
      this.refs.formControl.value = this.props.defaultValue || await Settings.get(this.props.id);
    }
  },
  render() {
    let { id, type, values, name, onChange } = this.props;
    switch (type) {
      case "boolean":
        return React.createElement("div", {},
          React.createElement("input", { type: "checkbox" }),
          React.createElement("label", {}, name)
        );
      case "string":
        return React.createElement("div", {},
          React.createElement("select", {
            ref: "formControl",
            async onChange(event) {
              if (onChange) {
                await onChange(event.target.value);
              } else {
                app.setState({ settings: Object.assign(app.state, {[id]: event.target.value}) })
              }
            }
          },
            values.map(v => React.createElement("option", {
              value: v.id
            }, v.label))
          )
        );
    }
  }
}));
