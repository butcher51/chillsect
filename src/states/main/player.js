var Player = function (state) {

    this.state = state;
    this.engine = state.engine;

    this.money = 0;
    this.kyberCrystal = 0;
    this.enemyKilled = 0;
    this.objectDestroyed = 0;

};

Player.prototype.constructor = Player;

//Player.prototype.achievements = [];

//Player.prototype.upgrades = {};

//Player.prototype.weapons = {};

//Player.prototype.ships = {};

Player.prototype.init = function () {

};

export default Player;