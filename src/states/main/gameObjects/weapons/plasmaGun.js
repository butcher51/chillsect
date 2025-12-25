import { AdditiveBlending, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping } from "three";
import BasicWeapon from "./laserGun";
import Projectile from "./projectile";
import ParticleSystems from "../../particleSystems";
import ProjectileRenderer from "./projectileRenderer";

var PlasmaGun = function(state, weaponIndex) {
	BasicWeapon.call(this, state, weaponIndex);
};

PlasmaGun.prototype = Object.create(BasicWeapon.prototype);
PlasmaGun.prototype.constructor = PlasmaGun;

PlasmaGun.prototype.projectileIndex = 0;
PlasmaGun.prototype.projectileForce = 1200;

PlasmaGun.prototype.blockTime = 0.3;
PlasmaGun.prototype.strength = 15; //              1/0.4 * 100      =   250 hp/sec

PlasmaGun.prototype.projectileLife = 80;

PlasmaGun.prototype.amount = 99;

PlasmaGun.prototype.initWeapon = function() {
	var material = new MeshBasicMaterial({
		color: 0xffffff,
		map: this.engine.loader.resources["ship01texture"].texture
	});

	this.weaponMesh = new Mesh(this.engine.loader.resources["emeraldWeaponModel"].geometry, material);
};

PlasmaGun.prototype.shoot = function() {
	if (this.amount < 1) {
		this.state.weapons.set(this.weaponIndex - 1);
		return;
	}
	this.shootCommon();
};

PlasmaGun.prototype.initMuzzleFlash = function() {
	var texture = this.engine.loader.resources.weaponsTexture.texture.clone();
	texture.needsUpdate = true;
	texture.offset.x = 0.5;
	texture.offset.y = 0;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(0.25, 0.25);

	var material = new MeshBasicMaterial({
		map: texture,
		transparent: true,
		blending: AdditiveBlending
	});

	var size = this.ship.size;

	var geometry = new PlaneGeometry(40 / size, 100 / size, 1, 1);

	var muzzleFlash = new Mesh(geometry, material);
	muzzleFlash.rotation.x = -90 * (Math.PI / 180);
	muzzleFlash.position.set(15 / size, 10 / size, 40 / size);
	muzzleFlash.visible = false;
	muzzleFlash.renderOrder = 2;

	this.ship.warpperObj.children[0].add(muzzleFlash);

	this.muzzleFlash = muzzleFlash;

	var muzzleFlash2 = new Mesh(geometry, material);
	muzzleFlash2.rotation.x = -90 * (Math.PI / 180);
	muzzleFlash2.position.set(-(15 / size), 10 / size, 40 / size);
	muzzleFlash2.visible = false;
	muzzleFlash2.renderOrder = 3;

	this.ship.warpperObj.children[0].add(muzzleFlash2);

	this.muzzleFlash2 = muzzleFlash2;
};

PlasmaGun.prototype.releaseMuzzleFlash = function() {
	this.muzzleFlash.visible = true;
	this.muzzleFlash2.visible = true;
};

PlasmaGun.prototype.releaseProjectiles = function(direction, angle) {
	this.releaseProjectile(direction, angle, 1);
	this.releaseProjectile(direction, angle, 2);
	this.releaseProjectile(direction, angle, 3);
	this.releaseProjectile(direction, angle, 4);
};

PlasmaGun.prototype.releaseProjectile = function(direction, angle, index) {
	var projectile = this.projectileBuffer[this.projectileIndex++];

	if (this.projectileIndex >= this.projectileBufferSize) {
		this.projectileIndex = 0;
	}

	projectile.onShoot();

	var a, b;

	if (index === 1) {
		a = 0.28;
		b = 0.025;
	} else if (index === 2) {
		a = -0.28;
		b = -0.025;
	} else if (index === 3) {
		a = 0.3;
		b = 0.12;
	} else if (index === 4) {
		a = -0.3;
		b = -0.12;
	}

	projectile.body.position[0] = this.ship.position.x + Math.cos(angle + a) * 70;
	projectile.body.position[1] = this.ship.position.y + Math.sin(angle + a) * 70;

	projectile.body.velocity[0] = this.ship.body.velocity[0] + Math.cos(angle + b) * this.projectileForce;
	projectile.body.velocity[1] = this.ship.body.velocity[1] + Math.sin(angle + b) * this.projectileForce;

	projectile.body.angle = this.ship.body.angle + Math.PI / 2;

	projectile.visible = true;
};

PlasmaGun.prototype.initProjectiles = function() {
	this.projectileBufferSize = 20;
	this.projectileBuffer = [];

	for (var i = 0; i < this.projectileBufferSize; i++) {
		this.projectileBuffer.push(new Projectile(this.engine, ParticleSystems.types.redLaserBullet, this.projectileLife, this.strength));
	}

	this.projectileRender = new ProjectileRenderer({
		projectileBufferSize: this.projectileBufferSize,
		projectileBuffer: this.projectileBuffer,
		texture: this.engine.loader.resources.weaponsTexture.texture,
		textureCrop: { x: 1, y: 0.25 },
		size: 20
	});

	this.engine.scene.scene.add(this.projectileRender);
};

PlasmaGun.prototype.update = function() {
	if (this.muzzleFlash.visible === true && this.lastShootTime + this.muzzleFlashBlockTime < this.engine.time) {
		this.muzzleFlash.visible = false;
		this.muzzleFlash2.visible = false;
	}

	this.projectileRender.update();
};

export default PlasmaGun;
