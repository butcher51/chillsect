import { AdditiveBlending, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping } from "three";
import BasicWeapon from "./laserGun.js";
import Projectile from "./projectile.js";
import ParticleSystems from "../../particleSystems.js";
import ProjectileRenderer from "./projectileRenderer.js";

class PhaserGun extends BasicWeapon {

	projectileIndex = 0;
	projectileForce = 2000;

	blockTime = 0.15; // TODO UJRA SZÁMOLNI
	energyUsage = 0.04; //           (1/0.4) * 0.04          =    0.1 energy/sec

	// getters, not fields: read during super() -> initProjectiles() (see laserGun.js)
	get strength() { return 15; } //                (1/0.4) * 2 * 20        =    100hp/sec
	get projectileLife() { return 60; }

	side = -1;
	muzzleFlashBlockTime = 0.06;

	amount = 99;

	constructor(state, weaponIndex) {
		super(state, weaponIndex);
	}

	initWeapon() {
		var material = new MeshBasicMaterial({
			color: 0xffffff,
			map: this.engine.loader.resources["ship01texture"].texture
		});

		this.weaponMesh = new Mesh(this.engine.loader.resources["redPlasmaWeaponModel"].geometry, material);
	}

	shoot() {
		if (this.amount < 1) {
			this.state.weapons.set(this.weaponIndex - 1);
			return;
		}
		this.shootCommon();
	}

	initProjectiles() {
		this.projectileBufferSize = 20;
		this.projectileBuffer = [];

		for (var i = 0; i < this.projectileBufferSize; i++) {
			this.projectileBuffer.push(new Projectile(this.engine, ParticleSystems.types.redLaserBullet, this.projectileLife, this.strength));
		}

		this.projectileRender = new ProjectileRenderer({
			projectileBufferSize: this.projectileBufferSize,
			projectileBuffer: this.projectileBuffer,
			texture: this.engine.loader.resources.weaponsTexture.texture,
			textureCrop: { x: 0.25, y: 1 }
		});
		this.projectileRender.position.z = 6;

		this.engine.scene.scene.add(this.projectileRender);
	}

	initMuzzleFlash() {
		var texture = this.engine.loader.resources.weaponsTexture.texture.clone();
		texture.needsUpdate = true;
		texture.offset.x = 0.25;
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

		var geometry = new PlaneGeometry(40 / size, 70 / size, 1, 1);

		var muzzleFlash = new Mesh(geometry, material);
		muzzleFlash.rotation.x = -90 * (Math.PI / 180);
		muzzleFlash.position.set(22 / size, 6 / size, 32 / size);
		muzzleFlash.visible = false;
		muzzleFlash.renderOrder = 2;

		this.ship.warpperObj.children[0].add(muzzleFlash);

		this.muzzleFlash = muzzleFlash;

		var muzzleFlash2 = new Mesh(geometry, material);
		muzzleFlash2.rotation.x = -90 * (Math.PI / 180);
		muzzleFlash2.position.set(-(22 / size), 6 / size, 32 / size);
		muzzleFlash2.visible = false;
		muzzleFlash2.renderOrder = 3;

		this.ship.warpperObj.children[0].add(muzzleFlash2);

		this.muzzleFlash2 = muzzleFlash2;
	}

	releaseMuzzleFlash() {
		this.muzzleFlash.visible = true;
		this.muzzleFlash2.visible = true;
	}

	releaseProjectiles(direction, angle) {
		this.releaseProjectile(direction, angle);
		this.releaseProjectile(direction, angle);
	}

	releaseProjectile(direction, angle) {
		var projectile = this.projectileBuffer[this.projectileIndex++];

		if (this.projectileIndex >= this.projectileBufferSize) {
			this.projectileIndex = 0;
		}

		projectile.onShoot();

		projectile.body.position[0] = this.ship.position.x + Math.cos(angle + 0.3 * this.side) * 75;
		projectile.body.position[1] = this.ship.position.y + Math.sin(angle + 0.3 * this.side) * 75;

		projectile.body.velocity[0] = this.ship.body.velocity[0] + Math.cos(angle - 0.01 * this.side) * this.projectileForce;
		projectile.body.velocity[1] = this.ship.body.velocity[1] + Math.sin(angle - 0.01 * this.side) * this.projectileForce;

		projectile.body.angle = this.ship.body.angle + Math.PI / 2;

		projectile.visible = true;

		this.side *= -1;
	}

	update() {
		if (this.muzzleFlash.visible === true && this.lastShootTime + this.muzzleFlashBlockTime < this.engine.time) {
			this.muzzleFlash.visible = false;
			this.muzzleFlash2.visible = false;
		}

		this.projectileRender.update();
	}
}

export default PhaserGun;
