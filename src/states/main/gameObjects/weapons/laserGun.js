import {RepeatWrapping, AdditiveBlending, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, PointLight} from 'three';
import Projectile from './projectile';
import ProjectileRenderer from './projectileRenderer';
import ParticleSystems from '../../particleSystems';
import CONFIG from '../../../../config';
import Util from '../../../../util';

var LaserWeapon = function (state, weaponIndex) {

    Object3D.call(this);

    this.weaponIndex = weaponIndex;
    this.engine = state.engine;
    this.state = state;
    this.ship = state.ship;

    this.initWeapon();
    this.initProjectiles();
    this.initMuzzleFlash();

};

LaserWeapon.prototype = Object.create(Object3D.prototype);
LaserWeapon.prototype.constructor = LaserWeapon;

LaserWeapon.prototype.type = 'laser';

LaserWeapon.prototype.projectileIndex = 0;
LaserWeapon.prototype.projectileForce = 2000;

LaserWeapon.prototype.blockTime = 0.15;// TODO UJRA SZÁMOLNI
LaserWeapon.prototype.strength = 15;//                1/0.4 * 20      =   50 hp/sec

LaserWeapon.prototype.projectileLife = 40;

LaserWeapon.prototype.side = -1;
LaserWeapon.prototype.muzzleFlashBlockTime = 0.05;

LaserWeapon.prototype.amount = 99;

LaserWeapon.prototype.initWeapon = function () {

    var material = new MeshBasicMaterial({
        color: 0xffffff,
        map: this.engine.loader.resources['ship01texture'].texture
    });

    this.weaponMesh = new Mesh(this.engine.loader.resources['basicWeaponModel'].geometry, material);
    this.weaponMesh.position.x = 0;
    this.weaponMesh.position.y = 0;
    this.weaponMesh.position.z = 0;

};

LaserWeapon.prototype.detachWeapon = function () {
    this.ship.warpperObj.children[0].remove(this.weaponMesh);
};

LaserWeapon.prototype.attachWeapon = function () {
    this.ship.warpperObj.children[0].add(this.weaponMesh);
};

LaserWeapon.prototype.initProjectiles = function () {

    this.projectileBufferSize = 10;
    this.projectileBuffer = [];

    for (var i = 0; i < this.projectileBufferSize; i++) {
        this.projectileBuffer.push(
            new Projectile(this.engine, ParticleSystems.types.redLaserBullet, this.projectileLife, this.strength)
        );
    }

    this.projectileRender = new ProjectileRenderer({
        projectileBufferSize: this.projectileBufferSize,
        projectileBuffer: this.projectileBuffer,
        texture: this.engine.loader.resources.weaponsTexture.texture,
        textureCrop: {x: 0.25, y: 0.75}
    });
    this.projectileRender.position.z = 14;

    this.engine.scene.scene.add(this.projectileRender);


};

LaserWeapon.prototype.muzzleFlash = null;

LaserWeapon.prototype.initMuzzleFlash = function () {

    var texture = this.engine.loader.resources.weaponsTexture.texture.clone();
    texture.needsUpdate = true;
    texture.offset.x = 0.25;
    texture.offset.y = 0.5;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(0.25, 0.25);

    var material = new MeshBasicMaterial({
        map: texture,
        transparent: true,
        blending: AdditiveBlending
    });

    var size = this.ship.size;

    var geometry = new PlaneGeometry(60 / size, 80 / size, 1, 1);

    var muzzleFlash = new Mesh(geometry, material);
    //muzzleFlash.rotation.z = -90 * (Math.PI / 180);
    muzzleFlash.rotation.x = -90 * (Math.PI / 180);
    muzzleFlash.position.set(16 / size, 14 / size, 25 / size);//oldalra fel előre
    muzzleFlash.visible = false;
    muzzleFlash.renderOrder = 2;

    this.ship.warpperObj.children[0].add(muzzleFlash);

    this.muzzleFlash = muzzleFlash;

};

LaserWeapon.prototype.shootCommon = function () {

    if (!(this.ship.energy > CONFIG.ENERGY_MANAGEMENT.MIN_VALUE)) {
        return;
    }

    if (this.lastShootTime + this.blockTime > this.engine.time) {
        return;
    }
    this.lastShootTime = this.engine.time;

    this.releaseMuzzleFlash();

    var angle = Util.normalizeAngle(this.ship.body.angle);

    this.releaseProjectiles(Util.vectorFromAngle(angle), angle);

    if (this.state.console) {
        this.state.console.updateWeaponAmount(this.weaponIndex,--this.amount);
    }

    this.playShootSound();
};

LaserWeapon.prototype.shoot = LaserWeapon.prototype.shootCommon;

LaserWeapon.prototype.playShootSound = function () {
    this.state.sounds.play("basicWeapon");
};

LaserWeapon.prototype.releaseMuzzleFlash = function () {
    this.muzzleFlash.visible = true;
};

LaserWeapon.prototype.releaseProjectiles = function (direction, angle) {

    this.releaseProjectile(direction, angle);

};

LaserWeapon.prototype.releaseProjectile = function (direction, angle) {

    var projectile = this.projectileBuffer[this.projectileIndex++];

    if (this.projectileIndex >= this.projectileBufferSize) {
        this.projectileIndex = 0;
    }

    projectile.onShoot();

    this.setShotPosition(projectile, angle);

    projectile.body.velocity[0] = this.ship.body.velocity[0] + direction[0] * this.projectileForce;
    projectile.body.velocity[1] = this.ship.body.velocity[1] + direction[1] * this.projectileForce;

    projectile.body.angle = this.ship.body.angle + Math.PI / 2;

    projectile.visible = true;

};

LaserWeapon.prototype.setShotPosition = function (projectile, angle) {

    projectile.body.position[0] = this.ship.position.x + ((Math.cos(angle + 0.2 * this.side) * 75));
    projectile.body.position[1] = this.ship.position.y + ((Math.sin(angle + 0.2 * this.side) * 75));

    this.muzzleFlash.position.x *= -1;

    this.side *= -1;

};

LaserWeapon.prototype.update = function () {

    if (this.muzzleFlash) {
        if (this.muzzleFlash.visible === true && this.lastShootTime + this.muzzleFlashBlockTime < this.engine.time) {
            this.muzzleFlash.visible = false;
        }
    }

    this.projectileRender.update();
};

export default LaserWeapon;