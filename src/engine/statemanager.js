class StateManager {
    constructor(engine) {

        this.states = {};
        this.active = null;

        this.engine = engine;
    }

    add(key, state) {
        state.engine = this.engine;
        this.states[key] = state;
    }

    get(key) {
        if (!key && !this.states[key]) {
            return this.states[this.active];
        }
        return this.states[key];
    }

    start(key, params) {
        if (this.active) {
            this.states[this.active].stop();
            this.active = null;
        }
        this.active = key;
        if (!this.states[key]) {
            console.error('State not found: ' + key);
            return;
        }
        this.states[key].start(params);
    }

    update() {
        if (this.active) {
            this.states[this.active].update();
        }
    }

    resize() {
        if (this.active) {
            this.states[this.active].resize();
        }
    }
}
export default StateManager;