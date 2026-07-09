import LaserGun from "./gameObjects/weapons/laserGun.js"; //0
import PhaserGun from "./gameObjects/weapons/phaserGun.js"; //1
import PlasmaGun from "./gameObjects/weapons/plasmaGun.js"; //2
import GatlingGun from "./gameObjects/weapons/gatlingGun.js"; //3
import FusionGun from "./gameObjects/weapons/fusionGun.js"; //4

import Rpg from "./gameObjects/weapons/rpg.js"; //5

class WeaponsController {
    enabled = false;
    weapons = null;
    secondaryWeapons = null;

    weapon = null;
    secondaryWeapon = null;

    constructor(state) {

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

    }

    set(index) {

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

    }

    setSecondary(index) {
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
    }

    shoot(target) {
        if (this.weapon !== null && this.enabled === true) {
            this.weapon.shoot(target);
        }
    }

    shootSecondary(target) {
        if (this.secondaryWeapon !== null && this.enabled === true) {
            this.secondaryWeapon.shoot(target);
        }
    }

    update() {

        for (var i = 0, l = this.weapons.length; i < l; i++) {
            this.weapons[i].update();
        }
        for (i = 0, l = this.secondaryWeapons.length; i < l; i++) {
            this.secondaryWeapons[i].update();
        }

    }
}

export default WeaponsController;
