import { Audio, MeshBasicMaterial, Mesh, Object3D, PlaneBufferGeometry } from "three";
import { vec2 } from "p2";
import CONFIG from "../../../../config.js";
import Util from "../../../../util.js";
import AbstractEnemy from "./AbstractEnemy.js";

class Enemy02 extends AbstractEnemy {

	accel = 50;
	angleLerp = 0.3;
	speedLimit = 350;

	sightRangeSqr = Math.pow(1200, 2); //mikor lat meg
	attackRangeSqr = Math.pow(200, 2); //mikor tamad
	biteRangeSqr = Math.pow(80, 2); //mikor harap (sebez)
	startRestDistanceSqr = Math.pow(100, 2); //mekkora távon pihen le a startpostól

	collisionCheckTime = 0;
	collisionCheckTimeBlock = 0.5;

	constructor() {
		super();

		// var protoScene = this.engine.loader.resources['Enemy02ModelAnim'].scene;

		if (!Enemy02.material) {
			Enemy02.material = new MeshBasicMaterial({
				color: 0xffffff,
				transparent:true,
				map: this.engine.loader.resources["enemy02Texture"].texture
			});
		}

		var wrapper = new Object3D();

		this.add(wrapper);

		// for (var i = 0, mesh, l = protoScene.meshes.length; i < l; i++) {
		//     mesh = protoScene.meshes[i].clone();
		//     mesh.material = Enemy02.material;
		//     wrapper.add(mesh);
		// }

		var mesh = new Mesh(new PlaneBufferGeometry(3, 3, 1, 1), Enemy02.material);

		wrapper.add(mesh);

		// wrapper.rotation.x = 90 * (Math.PI / 180);
		// wrapper.rotation.y = -90 * (Math.PI / 180);
		wrapper.scale.set(this.size, this.size, this.size);

		this.initPhysics({
			collisionGroup: CONFIG.COLLISION_MASK.ENEMY,
			collisionMask: CONFIG.COLLISION_MASK.PROJECTILE | CONFIG.COLLISION_MASK.SHIP | CONFIG.COLLISION_MASK.SPACE_OBJECT | CONFIG.COLLISION_MASK.ENEMY
		});

		// this.moveClip = this.engine.mixer.clipAction(protoScene.animations[0], this);

		//if (CONFIG.DEBUG_ENEMY_FOLLOW) {
		//var plane = new PlaneBufferGeometry(100, 100, 1, 1);
		//var material = new MeshBasicMaterial({color: 0xff0000, wireframe: true, opacity: 0.2, transparent: true});
		//this.targetObject = new Mesh(plane, material);
		//this.add(this.targetObject);
		//}

		this.initSounds();
	}

	initSounds() {
		if (!Enemy02.sounds) {
			Enemy02.sounds = {};
			var hitSound = [];
			for (var i = 0, sound; i < 4; i++) {
				sound = new Audio(this.engine.audioListener);
				sound.setBuffer(this.engine.loader.resources["enemy01HitSound"].buffer);
				hitSound[i] = sound;
			}
			Enemy02.sounds.impact = hitSound;

			var deathSound = [];
			for (i = 0; i < 3; i++) {
				sound = new Audio(this.engine.audioListener);
				sound.setBuffer(this.engine.loader.resources["enemy01DeathSound"].buffer);
				deathSound[i] = sound;
			}
			Enemy02.sounds.death = deathSound;
		}
		this.sounds = Enemy02.sounds;
	}

	setAleas(aleas) {
		AbstractEnemy.prototype.setAleas.call(this, aleas);

		this.size = 25; //aleas[2] szabad
		this.clickSize = (this.size + 100) * (this.size + 100);

		this.hpMax = 10;

		this.animationState = 0;

		//this.moveClip.stop();
		//this.attackClip.stop();

		this.body.shapes[0].radius = 35;
		this.body.shapes[0].updateBoundingRadius();

		this.body.mass = 200;
		this.body.updateMassProperties();

		this.children[0].scale.set(this.size, this.size, this.size);
		this.children[0].visible = true;

		console.log(this);

		if (this.aleas[4] > 0) {
			this.hp = this.aleas[4];
			this.enable();
			this.ready();
		} else {
			this.hp = -1;
			this.disable();
		}
	}

	ready() {
		AbstractEnemy.prototype.ready.call(this);
		if (CONFIG.DEBUG_ENEMY_FOLLOW) {
			this.targetObject.position.x = this.body.position[0];
			this.targetObject.position.y = this.body.position[1];
		}
	}

	loot() {
		setTimeout(() => {
			for (var i = 0, il = 3; i < il; i++) {
				this.state.loots.spawn(this, CONFIG.LOOTS.MONEY);
			}
		}, 100);
	}

	update() {
		if (this.visible === false) {
			return;
		}

		this.updatePhysics();

		if (this.hp === -1) {
			this.state.particleSystems.followExplodeEnemy(this);
			// this.body.velocity[0] *= this.drag;
			// this.body.velocity[1] *= this.drag;
			// this.body.angularVelocity *= this.drag;
			return;
		}

		var lerp = 0.06;
		var speedLimit = this.speedLimit;
		var shipDistanceSqr = vec2.squaredDistance(this.body.position, this.state.ship.body.position);
		var startDistanceSqr = vec2.squaredDistance(this.body.position, this.startPosition);

		if (this.state.ship.dead === false && this.state.ship.active === true && this.sightRangeSqr > shipDistanceSqr) {
			if (this.collisionCheckTime < this.engine.time) {
				this.target = this.state.ship.body.position;

				var vb = this.state.world.children;
				for (var i = 0, d, o, il = vb.length; i < il; i++) {
					o = vb[i];
					if (o.collisionMask !== CONFIG.COLLISION_MASK.SPACE_OBJECT) {
						continue;
					}
					if (o == this) {
						continue;
					}
					if (o.visible === true) {
						d = Util.distToSegmentSquared(o.body.position, this.body.position, this.target);
						if (d < o.size * o.size) {
							this.target = Util.getAvoidPoint(o.body.position, this.body.position, this.target, o.size * 2);
						}
					}
				}
				this.collisionCheckTime = this.engine.time + this.collisionCheckTimeBlock;

				// if (this.animationState === 0) {
				// 	this.animationState = 1;
				// 	this.moveClip.play();
				// }
			}

			if (this.attackRangeSqr > shipDistanceSqr) {
				lerp = 0.5;
				// this.body.velocity[0] *= 0.95;
				// this.body.velocity[1] *= 0.95;
				// this.body.angularVelocity *= 0.95;
				//speedLimit = 500;
				if (this.biteRangeSqr > shipDistanceSqr) {
					this.state.ship.collide(CONFIG.ENERGY_MANAGEMENT.SHIP_ATTACK_BY_ENEMY_00);
					this.die();
					this.hp = -1;
					this.playSound("death");
				}
			}
		} else {
			this.target = this.startPosition;
			if (startDistanceSqr < this.startRestDistanceSqr) {
				this.target = null;
				// if (this.animationState > 0) {
				// 	this.animationState = 0;
				// 	this.moveClip.stop();
				// }
			}
		}

		if (this.target) {
			// ez majd lődözni fog
			// this.targetCursor[0] += (this.target[0] - this.targetCursor[0]) * lerp;
			// this.targetCursor[1] += (this.target[1] - this.targetCursor[1]) * lerp;
			// if (CONFIG.DEBUG_ENEMY_FOLLOW) {
			// 	this.targetObject.position.x = this.targetCursor[0];
			// 	this.targetObject.position.y = this.targetCursor[1];
			// }
			// this.body.angle = Util.angleToRad(
			// 	Util.lerpAngle(Util.radToAngle(this.body.angle), Util.radToAngle(Util.v2ToRad(this.targetCursor[0] - this.body.position[0], this.targetCursor[1] - this.body.position[1])), this.angleLerp)
			// );
			// this.body.velocity[0] += Math.cos(this.body.angle) * this.accel;
			// this.body.velocity[1] += Math.sin(this.body.angle) * this.accel;
			// if (vec2.squaredLength(this.body.velocity) > speedLimit * speedLimit) {
			// 	vec2.normalize(this.body.velocity, this.body.velocity);
			// 	this.body.velocity[0] *= speedLimit;
			// 	this.body.velocity[1] *= speedLimit;
			// }
		} else {
			// this.body.velocity[0] *= this.drag;
			// this.body.velocity[1] *= this.drag;
			// this.body.angularVelocity *= this.drag;
		}
	}
}

export default Enemy02;
