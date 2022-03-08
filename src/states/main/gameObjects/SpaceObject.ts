import { Color, Mesh } from "three";
import { Body, Circle } from "p2";
import CONFIG from "../../../config";
import { Game } from "../../..";

export default class SpaceObject extends Mesh {

  public materialBuffer: any = [];
  public state: any;
  public materialIndex: any;
  public baseAngularVelocity: number;
  public color: any;
  public body: any;
  public scale : any;

  constructor(geometry, materialBuffer) {
    super(geometry, materialBuffer[0])
    this.state = Game.engine.states.get();
    this.materialBuffer = materialBuffer;

    this.scale.set(this.size, this.size, this.size);
    super.visible = false;

    var shape = new Circle({ radius: 1 });
    shape.collisionGroup = CONFIG.COLLISION_MASK.SPACE_OBJECT;
    shape.collisionMask =
      CONFIG.COLLISION_MASK.PROJECTILE | CONFIG.COLLISION_MASK.SHIP | CONFIG.COLLISION_MASK.SPACE_OBJECT | CONFIG.COLLISION_MASK.LOOT | CONFIG.COLLISION_MASK.ENEMY | CONFIG.COLLISION_MASK.STATIC_OBJECT;
    this.body = new Body({
      type: Body.DYNAMIC,
      position: [0, 0]
    });
    this.body.addShape(shape);
    this.body.gameObject = this;

    this.color = new Color(1, 1, 1);
  }

  public size = 100;
  public clickSize = 100;
  public hp = 100;
  public hpMax = 100;

  public collisionMask = CONFIG.COLLISION_MASK.SPACE_OBJECT;

  public aleas = [];

  public setMaterial(random) {
    if (random === 1) random = 0.999;
    this.materialIndex = Number.parseInt('' + random * this.materialBuffer.length);
    super.material = this.materialBuffer[this.materialIndex].clone();
  }

  public setAleas(aleas) {
    // 0:x
    // 1:y
    // 2:visibleFlag
    // 3:type
    // 4:hp
    // 5:size
    // 6,7,8,9,10,11,12,13,14,15

    this.aleas = aleas.slice();

    this.setScale(this.aleas[5]);
    this.hpMax = this.aleas[5];

    super.rotation.y = this.aleas[6] * Math.PI * 2;
    this.baseAngularVelocity = -0.005 + this.aleas[7] * 0.01;

    this.setMaterial(this.aleas[8]);
    this.setDrop(this.aleas[9]);

    if (this.aleas[9] < 0.2) {
      this.color.setRGB(0.4, 0.6, 1);
    } else {
      this.color.setRGB(1, 1, 1);
    }

    if (this.aleas[4] > 0) {
      this.enable();
      this.hp = this.aleas[4];
      this.setHitMaterial();
      this.ready();
    } else {
      this.hp = -1;
      this.disable();
    }
  }

  public setScale(size) {
    this.size = size;
    this.clickSize = (size + 50) * (size + 50);

    this.body.shapes[0].radius = size;
    this.body.shapes[0].updateBoundingRadius();

    this.body.mass = size * 5;
    this.body.updateMassProperties();

    super.scale.set(size, size, size);
  }

  public enable() {
    if (super.visible === true) {
      return;
    }
    super.visible = true;
    Game.engine.world.addBody(this.body);
  }

  public disable() {
    super.visible = false;
    Game.engine.world.removeBody(this.body);
  }

  public setDrop(r) { }

  public broke() {
    this.state.particleSystems.explodeAsteroid(this);
    this.state.sounds.play("impact");

    var this_ = this;
    setTimeout(function () {
      this_.brokeEnd();
      this_.state.sounds.play("explode");
    }, 300);
  }

  public brokeEnd() {
    this.disable();

    this.state.player.objectDestroyed++;

    if (this.aleas[9] < 0.2) {
      this.state.loots.spawn(this, CONFIG.LOOTS.ENERGY);
    }

    for (var i = 0, il = Number.parseInt('' + this.aleas[5] * 0.03); i < il; i++) {
      this.state.loots.spawn(this, CONFIG.LOOTS.MONEY);
    }
  }

  public hit(gameObject) {
    this.state.particleSystems.asteroidHit(gameObject);

    this.state.sounds.play("impact");

    if (this.hp === -1) {
      return;
    }

    if (this.hp > 0) {
      this.hp -= gameObject.strength;
      if (this.hp < 0) {
        this.hp = 0;
      }
    }

    //this.hitDrop();
    this.setHitMaterial();

    if (this.hp === 0) {
      this.broke();
      this.hp = -1;
    } else if (this.hp < this.hpMax * 0.5) {
      this.state.particleSystems.beforeExplodeAsteroid(this);
    }
  }

  public tmpColor = new Color(0, 0, 0);

  public setHitMaterial() {
    var c = this.hp / this.hpMax;

    this.tmpColor.copy(this.color);
    super.material.color.copy(this.color.lerp(CONFIG.RED, 1 - c));
  }

  public ready() { }

  public update() {
    if (super.visible === false) return;

    super.position.x = this.body.position[0];
    super.position.y = this.body.position[1];
    super.rotation.z += this.baseAngularVelocity;

    this.body.velocity[0] *= 0.999;
    this.body.velocity[1] *= 0.999;
  }
}


