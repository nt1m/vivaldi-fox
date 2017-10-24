class StateManager {
  constructor({ renderer, initialState, onStateUpdate }) {
    this.renderer = renderer;
    this.state = initialState;
    this.onStateUpdate = onStateUpdate;
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = Object.assign(this.state, state);
    this.onStateUpdate(this.state);
    this.render();

    return this;
  }

  render() {
    this.renderer(this.state);
    return this;
  }
}
