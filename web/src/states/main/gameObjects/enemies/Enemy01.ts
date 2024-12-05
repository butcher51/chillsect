import { Audio, MeshBasicMaterial, Object3D } from 'three';
import { vec2 } from 'p2';
import CONFIG from '../../../../config';
import Util from '../../../../util';
import AbstractEnemy from './abstractEnemy';
import { Game } from '../../../..';

export default class Enemy01 extends AbstractEnemy {
  public accel = 50;
  public angleLerp = 0.3;

  public speedLimit = 400;

  public sightRangeSqr = Math.pow(1200, 2); //mikor lat meg
  public attackRangeSqr = Math.pow(250, 2); //mikor tamad
  public biteRangeSqr = Math.pow(120, 2); //mikor harap (sebez)
  public startRestDistanceSqr = Math.pow(200, 2); //mekkora távon pihen le a startpostól

  //public toFarTime = 0;
  //public toFarTimeBlock = 2;

  public collisionCheckTime = 0;
  public collisionCheckTimeBlock = 0.5;
  static material: any;
  moveClip: any;
  attackClip: any;
  static sounds: any;
  hpMax: number;
  animationState: number;
  targetObject: any;

  constructor() {
    super();

    var protoScene = Game.engine.loader.resources['enemy01ModelAnim'].scene;

    if (!Enemy01.material) {
      Enemy01.material = new MeshBasicMaterial({
        color: 0xffffff,
        map: Game.engine.loader.resources['enemy01Texture'].texture
      });
    }

    var wrapper = new Object3D();

    this.add(wrapper);

    var mesh;
    for (var i = 0, l = protoScene.meshes.length; i < l; i++) {
      mesh = protoScene.meshes[i].clone();
      if (protoScene.meshes[i].name == 'c3') {
        mesh.children[0].material = Enemy01.material;
        mesh.children[1].material = Enemy01.material;
      }
      mesh.material = Enemy01.material;
      wrapper.add(mesh);
    }

    wrapper.rotation.x = 90 * (Math.PI / 180);
    wrapper.rotation.y = -90 * (Math.PI / 180);

    wrapper.scale.set(this.size, this.size, this.size);

    this.initPhysics({
      collisionGroup: CONFIG.COLLISION_MASK.ENEMY,
      collisionMask:
        CONFIG.COLLISION_MASK.PROJECTILE |
        CONFIG.COLLISION_MASK.SHIP |
        CONFIG.COLLISION_MASK.SPACE_OBJECT |
        CONFIG.COLLISION_MASK.ENEMY
    });

    this.moveClip = Game.engine.mixer.clipAction(protoScene.animations[0], this);
    this.attackClip = Game.engine.mixer.clipAction(protoScene.animations[1], this);

    //if (CONFIG.DEBUG_ENEMY_FOLLOW) {
    //var plane = new PlaneBufferGeometry(200, 200, 1, 1);
    //var material = new MeshBasicMaterial({color: 0xff0000, wireframe: true, opacity: 0.2, transparent: true});
    //this.targetObject = new Mesh(plane, material);
    //this.add(this.targetObject);
    //}

    this.initSounds();
  }

  public initSounds() {
    if (!Enemy01.sounds) {
      Enemy01.sounds = {};
      var hitSound = [];
      for (var i = 0, sound; i < 4; i++) {
        sound = new Audio(Game.engine.audioListener);
        sound.setBuffer(Game.engine.loader.resources['enemy01HitSound'].buffer);
        hitSound[i] = sound;
      }
      Enemy01.sounds.impact = hitSound;

      sound = new Audio(Game.engine.audioListener);
      sound.setBuffer(Game.engine.loader.resources['enemy01DeathSound'].buffer);
      Enemy01.sounds.death = [sound];
    }
    this.sounds = Enemy01.sounds;
  }

  public setAleas(aleas) {
    AbstractEnemy.prototype.setAleas.call(this, aleas);

    this.size = 20 + aleas[2] * 10;
    this.clickSize = (this.size + 100) * (this.size + 100);

    this.hpMax = 80;

    this.animationState = 0;

    this.moveClip.stop();
    this.attackClip.stop();

    this.body.shapes[0].radius = this.size * 2.25;
    this.body.shapes[0].updateBoundingRadius();

    this.body.mass = 10;
    this.body.updateMassProperties();

    this.children[0].scale.set(this.size, this.size, this.size);

    this.children[0].visible = true;

    if (this.aleas[4] >= 0) {
      this.hp = this.aleas[4];
      this.enable();
      this.ready();
    } else {
      this.hp = -1;
      this.disable();
    }
    //    this.hp = 80;
  }

  public loot() {
    setTimeout(() => {
      if (this.aleas[9] < 0.2) {
        this.state.loots.spawn(this, CONFIG.LOOTS.ENERGY);
      }
      for (var i = 0, il = 10; i < il; i++) {
        this.state.loots.spawn(this, CONFIG.LOOTS.MONEY);
      }
    }, 100);
  }

  public ready() {
    AbstractEnemy.prototype.ready.call(this);
    if (CONFIG.DEBUG_ENEMY_FOLLOW) {
      this.targetObject.position.x = this.body.position[0];
      this.targetObject.position.y = this.body.position[1];
    }
  }

  public update() {
    if (this.visible === false) {
      return;
    }

    this.updatePhysics();

    if (this.hp === -1) {
      this.state.particleSystems.followExplodeEnemy(this);
      this.body.velocity[0] *= this.drag;
      this.body.velocity[1] *= this.drag;
      this.body.angularVelocity *= this.drag;
      return;
    }

    var lerp = 0.06;
    var shipDistanceSqr = vec2.squaredDistance(this.body.position, this.state.ship.body.position);
    var startDistanceSqr = vec2.squaredDistance(this.body.position, this.startPosition);

    if (this.state.ship.dead === false && this.state.ship.active === true && this.sightRangeSqr > shipDistanceSqr) {
      if (this.collisionCheckTime < Game.engine.time) {
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
        this.collisionCheckTime = Game.engine.time + this.collisionCheckTimeBlock;

        if (this.animationState === 0) {
          this.animationState = 1;
          this.moveClip.play();
          this.attackClip.play();
        }
      }

      if (this.attackRangeSqr > shipDistanceSqr) {
        lerp = 0.5;
        this.body.velocity[0] *= 0.95;
        this.body.velocity[1] *= 0.95;
        this.body.angularVelocity *= 0.95;
        if (this.animationState === 1) {
          this.animationState = 2;
          this.attackClip.play();
        }
        if (this.biteRangeSqr > shipDistanceSqr) {
          this.state.ship.collide(CONFIG.ENERGY_MANAGEMENT.SHIP_ATTACK_BY_ENEMY_01);
          this.body.velocity[0] *= 0.9;
          this.body.velocity[1] *= 0.9;
        }
      } else {
        if (this.animationState === 2) {
          this.animationState = 0;
          this.attackClip.stop();
        }
      }
    } else {
      if (this.animationState === 2) {
        this.animationState = 0;
        this.attackClip.stop();
      }
      this.target = this.startPosition;

      if (startDistanceSqr < this.startRestDistanceSqr) {
        this.target = null;
        if (this.animationState > 0) {
          this.animationState = 0;
          this.moveClip.stop();
        }
      }
    }

    if (this.target) {
      this.targetCursor[0] += (this.target[0] - this.targetCursor[0]) * lerp;
      this.targetCursor[1] += (this.target[1] - this.targetCursor[1]) * lerp;

      if (CONFIG.DEBUG_ENEMY_FOLLOW) {
        this.targetObject.position.x = this.targetCursor[0];
        this.targetObject.position.y = this.targetCursor[1];
      }

      this.body.angle = Util.angleToRad(
        Util.lerpAngle(
          Util.radToAngle(this.body.angle),
          Util.radToAngle(
            Util.v2ToRad(this.targetCursor[0] - this.body.position[0], this.targetCursor[1] - this.body.position[1])
          ),
          this.angleLerp
        )
      );

      this.body.velocity[0] += Math.cos(this.body.angle) * this.accel;
      this.body.velocity[1] += Math.sin(this.body.angle) * this.accel;

      var speedLimit = this.speedLimit; // + (Math.sin((Game.engine.time + this.id) * 0.5) * 100);
      if (vec2.squaredLength(this.body.velocity) > speedLimit * speedLimit) {
        vec2.normalize(this.body.velocity, this.body.velocity);
        this.body.velocity[0] *= speedLimit;
        this.body.velocity[1] *= speedLimit;
      }
    } else {
      this.body.velocity[0] *= this.drag;
      this.body.velocity[1] *= this.drag;
      this.body.angularVelocity *= this.drag;
    }
  }
}
