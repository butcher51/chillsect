var StateManager = function (engine) {

    this.states = {};
    this.active = null;

    this.engine = engine;

    this.add = function (key, state) {
        state.engine = this.engine;
        this.states[key] = state;
    };

    this.get = function (key) {
        if (!key && !this.states[key]) {
            return this.states[this.active];
        }
        return this.states[key];
    };

    this.start = function (key, params) {
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
    };

    this.update = function () {
        if (this.active) {
            this.states[this.active].update();
        }
    };

    this.resize = function () {
        if (this.active) {
            this.states[this.active].resize();
        }
    }
};
export default StateManager;