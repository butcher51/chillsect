import {Body, Circle} from "p2";
import CONFIG from "../../../../config";

var Projectile = function (engine, hitParticleSysType, life, strength) {

    this.engine = engine;

    this.hitParticleSysType = hitParticleSysType;

    this.body = new Body({
        mass: 0.25,//strength / 5,
        position: [0, 0]
    });

    this.body.addShape(new Circle({
        radius: 20,
        collisionGroup: CONFIG.COLLISION_MASK.PROJECTILE,
        collisionMask: CONFIG.COLLISION_MASK.SPACE_OBJECT | CONFIG.COLLISION_MASK.ENEMY
    }));

    this.body.gameObject = this;

    this.visible = false;
    this.renderOrder = 2;
    this.life = 0;
    this.endOfLife = life;
    this.strength = strength;

};

Projectile.prototype.constructor = Projectile;

Projectile.prototype.die = function () {

    this.life = -1;
    this.visible = false;

    var that = this;
    setTimeout(function () {
        that.engine.world.removeBody(that.body);
    }, 16);

};

Projectile.prototype.onShoot = function () {
    this.life = 0;
    this.visible = true;
    this.engine.world.addBody(this.body);
};

Projectile.prototype.update = function () {

    if (this.life === -1) {
        return;
    }
    if (this.life > this.endOfLife) {
        this.die();
        return;
    }
    this.life++;

};

export default Projectile;