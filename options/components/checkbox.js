"use strict";

/* exported Checkbox */

const Checkbox = createFactory(class CheckboxFactory extends Component {
  componentDidUpdate() {
    if (this.refs.checkbox.checked !== this.props.defaultChecked) {
      this.refs.checkbox.checked = this.props.defaultChecked;
    }
  }
  render() {
    let {defaultChecked, onChange, label} = this.props;
    return createElement("label", { className: "setting" },
      createElement("span", {}, label),  
      createElement("input", {
        type: "checkbox",
        defaultChecked,
        onChange,
        ref: "checkbox"
      })
    );
  }
});
