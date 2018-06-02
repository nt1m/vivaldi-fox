"use strict";

/* exported Checkbox */

const Input = createFactory(class extends Component {
  componentDidUpdate() {
    if (this.refs.input.value !== this.props.defaultValue) {
      this.refs.input.value = this.props.defaultValue;
    }
  }
  render() {
    let {defaultValue, onChange, type, min, max} = this.props;
    return createElement("input", {
      type,
      defaultValue,
      onChange: (e) => {
        if (e.target.reportValidity()) {
          onChange(e);
        }
      },
      min,
      max,
      ref: "input"
    });
  }
});
