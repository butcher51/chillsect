import { MeshBasicMaterial, Object3D } from 'three';
import Missile from './missile';
import ParticleSystems from '../../particleSystems';
import Util from '../../../../util';
import { Game } from '../../../..';

export default class Rpg extends Object3D {
  public state: any;
  public ship: any;
  public lastShootTime: number;
  public weaponIndex: any;
  public controlFlags: any;
  public projectileBuffer: any[];
  public projectileBufferSize: number;

  constructor(weaponIndex) {
    super();

    const state = (this.state = Game.engine.states.get());
    this.ship = state.ship;
    this.weaponIndex = weaponIndex;
    this.controlFlags = Game.engine.controls.getControlFlags();

    this.initProjectiles();
  }

  public projectileIndex = 0;
  public projectileForce = 20;

  public blockTime = 0.4;
  public strength = 300; //              1/0.4 * 100      =   250 hp/sec

  public projectileLife = 80;

  public amount = 99;

  public detachWeapon() {}

  public attachWeapon() {}

  public shoot() {
    // if (!(this.ship.energy > CONFIG.ENERGY_MANAGEMENT.MIN_VALUE)) {
    //     return;
    // }
    if (this.amount < 1) {
      return;
    }

    if (this.lastShootTime + this.blockTime > Game.engine.time) {
      return;
    }
    this.lastShootTime = Game.engine.time;

    this.releaseProjectiles();

    if (this.state.console) {
      this.state.console.updateSecondaryWeaponAmount(this.weaponIndex, --this.amount);
    }
  }

  public releaseProjectiles() {
    this.releaseProjectile();
    this.playShootSound();
    this.releaseSmoke();
  }

  public releaseSmoke() {
    this.state.particleSystems.asteroidHit(this.ship);
  }

  public releaseProjectile() {
    var angle = Util.normalizeAngle(this.ship.body.angle);
    var projectile = this.projectileBuffer[this.projectileIndex++];

    if (this.projectileIndex >= this.projectileBufferSize) {
      this.projectileIndex = 0;
    }

    this.setShotPosition(projectile);

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

  public setShotPosition(projectile) {
    projectile.body.position[0] = this.ship.position.x;
    projectile.body.position[1] = this.ship.position.y;
  }

  public playShootSound() {
    this.state.sounds.play('missile1');
  }

  public initProjectiles() {
    var material = new MeshBasicMaterial({
      color: 0xffffff,
      map: Game.engine.loader.resources['rpgRocketTexture'].texture
    });

    var geometry = Game.engine.loader.resources['rpgRocketModel'].geometry;

    this.projectileBufferSize = 10;
    this.projectileBuffer = [];

    for (var i = 0, p; i < this.projectileBufferSize; i++) {
      p = new Missile(
        Game.engine,
        geometry,
        material,
        ParticleSystems.types.rocketExplosion,
        this.projectileLife,
        this.strength
      );
      Game.engine.add(p);
      this.projectileBuffer.push(p);
    }
  }

  public update() {
    for (var i = 0, p; i < this.projectileBufferSize; i++) {
      p = this.projectileBuffer[i];
      if (p.visible) {
        p.update();
      }
    }
  }
}
