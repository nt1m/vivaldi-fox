"use strict";

/* exported Slider */

const Slider = createFactory(class SliderFactory extends Component {
  componentDidUpdate() {
    if (this.refs.input.value !== this.props.defaultValue) {
      this.refs.input.value = this.props.defaultValue;
    }
  }
  render() {
    let {defaultValue, onChange, label} = this.props;
    return createElement("label", { className: "setting" },
      createElement("input", {
        type: "range",
        defaultValue,
        onChange,
        ref: "input",
        min: 0,
        max: 1,
        step: 0.01
      }),
      createElement("span", {}, label)
    );
  }
});
