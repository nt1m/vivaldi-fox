class StateManager {
  constructor({ renderer, initialState, actions }) {
    this.renderer = renderer;
    this.state = initialState;
    this.actions = {};

    for (let action in actions) {
      this.actions[action] = (...args) => {
        actions[action].bind(this)(...args);
        this.render();
      };
    }
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