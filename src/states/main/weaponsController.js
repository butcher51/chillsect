import LaserGun from "./gameObjects/weapons/laserGun"; //0
import PhaserGun from "./gameObjects/weapons/phaserGun"; //1
import PlasmaGun from "./gameObjects/weapons/plasmaGun"; //2
import GatlingGun from "./gameObjects/weapons/gatlingGun"; //3
import FusionGun from "./gameObjects/weapons/fusionGun"; //4

import Rpg from "./gameObjects/weapons/rpg"; //5

var WeaponsController = function (state) {

    this.state = state;
    this.engine = state.engine;

    this.controlFlags = this.engine.controls.getControlFlags();

    this.weapons = [
        new LaserGun(state,0),
        new PhaserGun(state,1),
        new GatlingGun(state,2),
        new PlasmaGun(state,3),
        new FusionGun(state,4)
    ];

    this.secondaryWeapons = [
        new Rpg(state, 0),
        new Rpg(state, 1)
    ];

};

WeaponsController.prototype.constructor = WeaponsController;

WeaponsController.prototype.enabled = false;
WeaponsController.prototype.weapons = null;
WeaponsController.prototype.secondaryWeapons = null;

WeaponsController.prototype.weapon = null;
WeaponsController.prototype.secondaryWeapon = null;

WeaponsController.prototype.set = function (index) {

    if (!this.weapons[index]) {
        return;
    }
    if (this.weapon) {
        this.weapon.detachWeapon();
    }
    this.weapon = this.weapons[index];
    this.weapon.attachWeapon();

    if (this.state.console) {
        this.state.console.renderWeapons(index);
    }

    this.state.sounds.play('powerup');

};

WeaponsController.prototype.setSecondary = function (index) {
    if (!this.secondaryWeapons[index]) {
        return;
    }
    if (this.secondaryWeapon) {
        this.secondaryWeapon.detachWeapon();
    }
    this.secondaryWeapon = this.secondaryWeapons[index];
    this.secondaryWeapon.attachWeapon();

    if (this.state.console) {
        this.state.console.renderSecondaryWeapons(index);
    }

    this.state.sounds.play('powerup');
};

WeaponsController.prototype.shoot = function (target) {
    if (this.weapon !== null && this.enabled === true) {
        this.weapon.shoot(target);
    }
};

WeaponsController.prototype.shootSecondary = function (target) {
    if (this.secondaryWeapon !== null && this.enabled === true) {
        this.secondaryWeapon.shoot(target);
    }
};

WeaponsController.prototype.update = function () {

    for (var i = 0, l = this.weapons.length; i < l; i++) {
        this.weapons[i].update();
    }
    for (i = 0, l = this.secondaryWeapons.length; i < l; i++) {
        this.secondaryWeapons[i].update();
    }

};

export default WeaponsController;