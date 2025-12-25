import { AdditiveBlending, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping } from "three";
import BasicWeapon from "./laserGun";
import Projectile from "./projectile";
import ParticleSystems from "../../particleSystems";
import ProjectileRenderer from "./projectileRenderer";

var GatlingGun = function(state, weaponIndex) {
	BasicWeapon.call(this, state, weaponIndex);
};

GatlingGun.prototype = Object.create(BasicWeapon.prototype);
GatlingGun.prototype.constructor = GatlingGun;

GatlingGun.prototype.projectileIndex = 0;
GatlingGun.prototype.projectileForce = 2000;

GatlingGun.prototype.blockTime = 0.1; // TODO UJRA SZÁMOLNI
GatlingGun.prototype.strength = 15; //  1/0.1 * 15     =       150 hp/sec

GatlingGun.prototype.projectileLife = 30;

GatlingGun.prototype.side = 1;

GatlingGun.prototype.muzzleFlash = null;

GatlingGun.prototype.amount = 99;

GatlingGun.prototype.initWeapon = function() {
	var material = new MeshBasicMaterial({
		color: 0xffffff,
		map: this.engine.loader.resources["ship01texture"].texture
	});

	this.weaponMesh = new Mesh(this.engine.loader.resources["gatlingWeaponModel"].geometry, material);
};

GatlingGun.prototype.shoot = function() {
	if (this.amount < 1) {
		this.state.weapons.set(this.weaponIndex - 1);
		return;
	}
	this.shootCommon();
};

GatlingGun.prototype.playShootSound = function() {
	this.state.sounds.play("basicWeapon");
};

GatlingGun.prototype.initMuzzleFlash = function() {
	var texture = this.engine.loader.resources.weaponsTexture.texture.clone();
	texture.needsUpdate = true;
	texture.offset.x = 0.75;
	texture.offset.y = 0.75;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(0.25, 0.25);

	var material = new MeshBasicMaterial({
		map: texture,
		transparent: true,
		blending: AdditiveBlending
	});

	var size = this.ship.size;

	var geometry = new PlaneGeometry(40 / size, 80 / size, 1, 1);

	var muzzleFlash = new Mesh(geometry, material);
	muzzleFlash.rotation.x = -90 * (Math.PI / 180);
	muzzleFlash.position.set(20 / size, 10 / size, 50 / size);
	muzzleFlash.visible = false;
	muzzleFlash.renderOrder = 2;

	this.ship.warpperObj.children[0].add(muzzleFlash);

	this.muzzleFlash = muzzleFlash;
};

GatlingGun.prototype.initProjectiles = function() {
	this.projectileBufferSize = 20;
	this.projectileBuffer = [];

	for (var i = 0; i < this.projectileBufferSize; i++) {
		this.projectileBuffer.push(new Projectile(this.engine, ParticleSystems.types.redLaserBullet, this.projectileLife, this.strength));
	}

	this.texture = this.engine.loader.resources.weaponsTexture.texture;

	this.projectileRender = new ProjectileRenderer({
		projectileBufferSize: this.projectileBufferSize,
		projectileBuffer: this.projectileBuffer,
		texture: this.engine.loader.resources.weaponsTexture.texture,
		textureCrop: { x: 0.75, y: 1 },
		size: 40
	});
	this.projectileRender.position.z = 11;

	this.engine.scene.scene.add(this.projectileRender);
};

GatlingGun.prototype.setShotPosition = function(projectile, angle) {
	projectile.body.position[0] = this.ship.position.x + Math.cos(angle + 0.27) * 75;
	projectile.body.position[1] = this.ship.position.y + Math.sin(angle + 0.27) * 75;
};

export default GatlingGun;
