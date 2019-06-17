import {vec2} from 'p2';
import CONFIG from '../../config';

var PhysicsWatcher = function (state) {

    this.state = state;
    this.engine = state.engine;

    var this_ = this;
    this.engine.world.on("impact", function (e) {
        this_.impact.call(this_, e);
    });
    this.engine.world.on("beginContact", function (e) {
        this_.beginContact.call(this_, e);
    });
    this.engine.world.on("endContact", function (e) {
        this_.endContact.call(this_, e);
    });

};

PhysicsWatcher.prototype.constructor = PhysicsWatcher;

PhysicsWatcher.prototype.tick = 0;

PhysicsWatcher.prototype.impact = function (evt) {

    var bodyA = evt.bodyA,
        bodyB = evt.bodyB;

    if (bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.PROJECTILE || bodyB.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.PROJECTILE) {

        var bulletBody = bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.PROJECTILE ? bodyA : bodyB,
            otherBody = bodyB == bulletBody ? bodyA : bodyB;

        if (otherBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SPACE_OBJECT ||
            otherBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.ENEMY) {
            otherBody.gameObject.hit(bulletBody.gameObject);
            bulletBody.gameObject.die();
        }
    }
};

PhysicsWatcher.prototype.beginContact = function (evt) {

    var bodyA = evt.bodyA,
        bodyB = evt.bodyB;

    if (bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.LOOT || bodyB.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.LOOT) {

        var loot = bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.LOOT ? bodyA : bodyB,
            shipBody = bodyB == loot ? bodyA : bodyB;

        if (shipBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP) {
            loot.gameObject.pickup();
        }

    } else if (bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP || bodyB.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP) {

        var ship = bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP ? bodyA : bodyB,
            otherBody = bodyB == ship ? bodyA : bodyB;

        if (otherBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SPACE_OBJECT) {
            ship.gameObject.beginContact(CONFIG.ENERGY_MANAGEMENT.SHIP_IMPACT_WITH_ASTEROID, vec2.squaredLength(ship.velocity));
        }
    }

};

PhysicsWatcher.prototype.endContact = function (evt) {

    var bodyA = evt.bodyA,
        bodyB = evt.bodyB;
    if (bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP || bodyB.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP) {

        var ship = bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP ? bodyA : bodyB,
            otherBody = bodyB == ship ? bodyA : bodyB;

        if (otherBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SPACE_OBJECT) {
            ship.gameObject.endContact();
        }
    }

};

PhysicsWatcher.prototype.update = function () {

    //if (this.shipInContactFlag === true) {
    //    //if (++this.tick > 180) {
    //    //    this.tick = 0;
    //    //    this.shipInContactFlag = false;
    //    //}
    //    this.state.ship.collide(CONFIG.ENERGY_MANAGEMENT.SHIP_COLLIDE_WITH_ASTEROID);
    //}

};

export default PhysicsWatcher;