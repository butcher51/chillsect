import { AdditiveBlending, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping } from "three";
import BasicWeapon from "./laserGun";
import Projectile from "./projectile";
import ParticleSystems from "../../particleSystems";
import ProjectileRenderer from "./projectileRenderer";

var EnemyGun1 = function(state, owner) {
	BasicWeapon.call(this, state, 0);
	this.owner = owner;
};

EnemyGun1.prototype = Object.create(BasicWeapon.prototype);
EnemyGun1.prototype.constructor = EnemyGun1;

EnemyGun1.prototype.projectileIndex = 0;
EnemyGun1.prototype.projectileForce = 2000;

EnemyGun1.prototype.blockTime = 0.1; // TODO UJRA SZÁMOLNI
EnemyGun1.prototype.strength = 15; //  1/0.1 * 15     =       150 hp/sec

EnemyGun1.prototype.projectileLife = 30;

EnemyGun1.prototype.side = 1;

EnemyGun1.prototype.amount = 99;

EnemyGun1.prototype.initWeapon = function() {
	var material = new MeshBasicMaterial({
		color: 0xffffff,
		map: this.engine.loader.resources["ship01texture"].texture
	});

	this.weaponMesh = new Mesh(this.engine.loader.resources["gatlingWeaponModel"].geometry, material);
};

EnemyGun1.prototype.playShootSound = function() {
	this.state.sounds.play("basicWeapon");
};

EnemyGun1.prototype.shoot = function() {
	if (this.lastShootTime + this.blockTime > this.engine.time) {
		return;
	}
	this.lastShootTime = this.engine.time;

	var angle = Util.normalizeAngle(this.owner); // monster pos

	this.releaseProjectiles(Util.vectorFromAngle(angle), angle);

	this.playShootSound();
};

EnemyGun1.prototype.initProjectiles = function() {
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

EnemyGun1.prototype.setShotPosition = function(projectile, angle) {
	projectile.body.position[0] = this.owner.position.x;
	projectile.body.position[1] = this.owner.position.y;
};

export default EnemyGun1;
