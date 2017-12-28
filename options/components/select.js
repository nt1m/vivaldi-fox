"use strict";

/* exported Select */

const Select = createFactory(class SelectFactory extends Component {
  componentDidUpdate() {
    if (this.refs.select.value !== this.props.defaultValue) {
      this.refs.select.value = this.props.defaultValue;
    }
  }
  render() {
    let {
      values,
      defaultValue,
      onChange,
      label
    } = this.props;
    return createElement("label", { className: "setting" },
      createElement("span", {}, label),
      createElement("select", { onChange, ref: "select", defaultValue },
        ...values.map(v => createElement("option", { value: v.value }, v.label))
      )
    );
  }
});
