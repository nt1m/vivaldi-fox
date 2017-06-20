class StateManager {
  constructor({ renderer, initialState }) {
    this.renderer = renderer;
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = Object.assign(this.state, state);
    this.render();
    return this;
  }

  render() {
    this.renderer(this.state);
    return this;
  }
}