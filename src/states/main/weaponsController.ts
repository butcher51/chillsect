import LaserGun from "./gameObjects/weapons/laserGun"; //0
import PhaserGun from "./gameObjects/weapons/phaserGun"; //1
import PlasmaGun from "./gameObjects/weapons/plasmaGun"; //2
import GatlingGun from "./gameObjects/weapons/gatlingGun"; //3
import FusionGun from "./gameObjects/weapons/fusionGun"; //4

import Rpg from "./gameObjects/weapons/rpg"; //5
import { Game } from "../..";

export default class WeaponsController {

    public enabled = false;
    public weapons = null;
    public secondaryWeapons = null;

    public weapon = null;
    public secondaryWeapon = null;
    public controlFlags: any;

    constructor(public state) {

        this.controlFlags = Game.engine.controls.getControlFlags();

        this.weapons = [
            new LaserGun(state, 0),
            new PhaserGun(state, 1),
            new GatlingGun(state, 2),
            new PlasmaGun(state, 3),
            new FusionGun(state, 4)
        ];

        this.secondaryWeapons = [
            new Rpg(state, 0),
            new Rpg(state, 1)
        ];
    }

    public set(index) {

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

    public setSecondary = function (index) {
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

    public shoot = function (target) {
        if (this.weapon !== null && this.enabled === true) {
            this.weapon.shoot(target);
        }
    }

    public shootSecondary = function (target) {
        if (this.secondaryWeapon !== null && this.enabled === true) {
            this.secondaryWeapon.shoot(target);
        }
    }

    public update() {

        for (var i = 0, l = this.weapons.length; i < l; i++) {
            this.weapons[i].update();
        }
        for (i = 0, l = this.secondaryWeapons.length; i < l; i++) {
            this.secondaryWeapons[i].update();
        }

    }
};
