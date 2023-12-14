import { vec2 } from 'p2';
import { Game } from '../..';
import CONFIG from '../../config';

export default class PhysicsWatcher {
  public tick = 0;
  public state: any;
  constructor(state) {
    this.state = state;

    Game.engine.world.on('impact', e => {
      this.impact(e);
    });
    Game.engine.world.on('beginContact', e => {
      this.beginContact(e);
    });
    Game.engine.world.on('endContact', e => {
      this.endContact(e);
    });
  }

  public impact(evt) {
    var bodyA = evt.bodyA,
      bodyB = evt.bodyB;

    if (
      bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.PROJECTILE ||
      bodyB.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.PROJECTILE
    ) {
      var bulletBody = bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.PROJECTILE ? bodyA : bodyB,
        otherBody = bodyB == bulletBody ? bodyA : bodyB;

      if (
        otherBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SPACE_OBJECT ||
        otherBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.ENEMY
      ) {
        otherBody.gameObject.hit(bulletBody.gameObject);
        bulletBody.gameObject.die();
      }
    }
  }

  public beginContact(evt) {
    var bodyA = evt.bodyA,
      bodyB = evt.bodyB;

    if (
      bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.LOOT ||
      bodyB.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.LOOT
    ) {
      var loot = bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.LOOT ? bodyA : bodyB,
        shipBody = bodyB == loot ? bodyA : bodyB;

      if (shipBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP) {
        loot.gameObject.pickup();
      }
    } else if (
      bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP ||
      bodyB.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP
    ) {
      var ship = bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP ? bodyA : bodyB,
        otherBody = bodyB == ship ? bodyA : bodyB;

      if (otherBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SPACE_OBJECT) {
        ship.gameObject.beginContact(
          CONFIG.ENERGY_MANAGEMENT.SHIP_IMPACT_WITH_ASTEROID,
          vec2.squaredLength(ship.velocity)
        );
      }
    }
  }

  public endContact(evt) {
    var bodyA = evt.bodyA,
      bodyB = evt.bodyB;
    if (
      bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP ||
      bodyB.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP
    ) {
      var ship = bodyA.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SHIP ? bodyA : bodyB,
        otherBody = bodyB == ship ? bodyA : bodyB;

      if (otherBody.shapes[0].collisionGroup === CONFIG.COLLISION_MASK.SPACE_OBJECT) {
        ship.gameObject.endContact();
      }
    }
  }

  public update() {
    // if (this.shipInContactFlag === true) {
    //    //if (++this.tick > 180) {
    //    //    this.tick = 0;
    //    //    this.shipInContactFlag = false;
    //    //}
    //    this.state.ship.collide(CONFIG.ENERGY_MANAGEMENT.SHIP_COLLIDE_WITH_ASTEROID);
    // }
  }
}
