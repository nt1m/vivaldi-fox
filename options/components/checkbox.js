const Checkbox = React.createFactory(class CheckboxFactory extends React.Component {
  componentDidUpdate() {
    this.refs["checkbox"].checked = this.props.defaultChecked;
  }
  render() {
    let {defaultChecked, onChange, label} = this.props;
    return createElement("label", { className: "setting" },
      createElement("input", {
        type: "checkbox",
        defaultChecked,
        onChange,
        ref: "checkbox"
      }),
      createElement("span", {}, label)
    );
  }
});