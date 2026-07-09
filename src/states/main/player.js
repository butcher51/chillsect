class Player {
    constructor(state) {

        this.state = state;
        this.engine = state.engine;

        this.money = 0;
        this.kyberCrystal = 0;
        this.enemyKilled = 0;
        this.objectDestroyed = 0;

    }

    init() {

    }
}

export default Player;
