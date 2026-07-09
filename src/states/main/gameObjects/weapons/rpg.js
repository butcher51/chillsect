import {MeshBasicMaterial, Object3D} from 'three';
import Missile from './missile.js';
import ParticleSystems from '../../particleSystems.js';
import Util from '../../../../util.js';

class Rpg extends Object3D {
    projectileIndex = 0;
    projectileForce = 20;

    blockTime = 0.4;
    strength = 300;//              1/0.4 * 100      =   250 hp/sec

    projectileLife = 80;

    amount = 99;

    constructor(state,weaponIndex) {

        super();

        this.engine = state.engine;
        this.state = state;
        this.ship = state.ship;
        this.weaponIndex = weaponIndex;
        this.controlFlags = this.engine.controls.getControlFlags();

        this.initProjectiles();

    }

    detachWeapon() {

    }

    attachWeapon() {

    }

    shoot() {

        // if (!(this.ship.energy > CONFIG.ENERGY_MANAGEMENT.MIN_VALUE)) {
        //     return;
        // }
        if (this.amount < 1) {
            return;
        }

        if (this.lastShootTime + this.blockTime > this.engine.time) {
            return;
        }
        this.lastShootTime = this.engine.time;

        this.releaseProjectiles();

        if (this.state.console) {
            this.state.console.updateSecondaryWeaponAmount(this.weaponIndex,--this.amount);
        }

    }

    releaseProjectiles() {

        this.releaseProjectile();
        this.playShootSound();
        this.releaseSmoke();

    }

    releaseSmoke() {
        this.state.particleSystems.asteroidHit(this.ship);
    }

    releaseProjectile() {

        var angle = Util.normalizeAngle(this.ship.body.angle);
        var projectile = this.projectileBuffer[this.projectileIndex++];

        if (this.projectileIndex >= this.projectileBufferSize) {
            this.projectileIndex = 0;
        }

        this.setShotPosition(projectile, angle);

        var direction = Util.vectorFromAngle(angle + (this.projectileIndex % 2 === 0 ? 0.2 : -0.2));

        projectile.body.velocity[0] = this.ship.body.velocity[0] + direction[0] * this.projectileForce;
        projectile.body.velocity[1] = this.ship.body.velocity[1] + direction[1] * this.projectileForce;
        //
        // var distance = Util.dist(this.ship.body.position,[this.ship.body.position[0]-this.controlFlags.mouse.x,this.ship.body.position[1]-this.controlFlags.mouse.y]);
        // console.log(distance);

        // projectile.body.angle = this.ship.body.angle + Math.PI / 2 - ( (this.projectileIndex % 2 === 0 ? 1 : -1) * Math.PI / 15  );
        projectile.body.angle = this.ship.body.angle + Math.PI / 2; // - ( (this.projectileIndex % 2 === 0 ? 1 : -1) * Math.PI / 15  );

        projectile.onShoot();

        projectile.visible = true;

    }

    setShotPosition(projectile) {

        projectile.body.position[0] = this.ship.position.x;
        projectile.body.position[1] = this.ship.position.y;

    }

    playShootSound() {
        this.state.sounds.play("missile1");
    }

    initProjectiles() {

        var material = new MeshBasicMaterial({
            color: 0xffffff,
            map: this.engine.loader.resources['rpgRocketTexture'].texture,
        });

        var geometry = this.engine.loader.resources['rpgRocketModel'].geometry;

        this.projectileBufferSize = 10;
        this.projectileBuffer = [];

        for (var i = 0, p; i < this.projectileBufferSize; i++) {
            p = new Missile(this.engine, geometry, material, ParticleSystems.types.rocketExplosion, this.projectileLife, this.strength);
            this.engine.add(p);
            this.projectileBuffer.push(p);
        }

    }

    update() {

        for (var i = 0, p; i < this.projectileBufferSize; i++) {
            p = this.projectileBuffer[i];
            if (p.visible) {
                p.update();
            }
        }

    }
}

export default  Rpg;

