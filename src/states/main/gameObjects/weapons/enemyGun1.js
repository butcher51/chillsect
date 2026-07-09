import { AdditiveBlending, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping } from "three";
import BasicWeapon from "./laserGun.js";
import Projectile from "./projectile.js";
import ParticleSystems from "../../particleSystems.js";
import ProjectileRenderer from "./projectileRenderer.js";
import Util from "../../../../util.js";

class EnemyGun1 extends BasicWeapon {

	projectileIndex = 0;
	projectileForce = 2000;

	blockTime = 0.1; // TODO UJRA SZÁMOLNI

	// getters, not fields: read during super() -> initProjectiles() (see laserGun.js)
	get strength() { return 15; } //  1/0.1 * 15     =       150 hp/sec
	get projectileLife() { return 30; }

	side = 1;

	amount = 99;

	constructor(state, owner) {
		super(state, 0);
		this.owner = owner;
	}

	initWeapon() {
		var material = new MeshBasicMaterial({
			color: 0xffffff,
			map: this.engine.loader.resources["ship01texture"].texture
		});

		this.weaponMesh = new Mesh(this.engine.loader.resources["gatlingWeaponModel"].geometry, material);
	}

	playShootSound() {
		this.state.sounds.play("basicWeapon");
	}

	shoot() {
		if (this.lastShootTime + this.blockTime > this.engine.time) {
			return;
		}
		this.lastShootTime = this.engine.time;

		var angle = Util.normalizeAngle(this.owner); // monster pos

		this.releaseProjectiles(Util.vectorFromAngle(angle), angle);

		this.playShootSound();
	}

	initProjectiles() {
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
	}

	setShotPosition(projectile, angle) {
		projectile.body.position[0] = this.owner.position.x;
		projectile.body.position[1] = this.owner.position.y;
	}
}

export default EnemyGun1;
