import GameObject from '../../../../engine/gameobject';
import CONFIG from '../../../../config';
import Util from '../../../../util';
import {vec2} from 'p2';

var Loot = function (lootType) {//abstract

    this.lootType = lootType;

    GameObject.call(this);

    this.initPhysics({
        radius: this.size,
        mass: 0.1,
        collisionGroup: CONFIG.COLLISION_MASK.LOOT,
        collisionMask: CONFIG.COLLISION_MASK.SHIP | CONFIG.COLLISION_MASK.SPACE_OBJECT
    });

    this.disable();

};

Loot.prototype = Object.create(GameObject.prototype);
Loot.prototype.constructor = Loot;

Loot.prototype.size = 60;

Loot.prototype.spawn = function (gameObject, type, dropOut) {

    if (dropOut) {

        var a = Util.v2ToRad(this.state.ship.body.position[0] - gameObject.body.position[0], this.state.ship.body.position[1] - gameObject.body.position[1]);
        var v = [gameObject.size + 30, 0];
        vec2.rotate(v, v, a);

        this.position.x = this.body.position[0] = gameObject.body.position[0] + v[0];
        this.position.y = this.body.position[1] = gameObject.body.position[1] + v[1];

        a += +(-Math.PI + Util.Random.get() * Math.PI * 2 );
        this.body.velocity[0] = Math.sin(a) * (50 + Util.Random.get() * 100);
        this.body.velocity[1] = Math.cos(a) * (50 + Util.Random.get() * 100);

    } else {

        this.position.x = this.body.position[0] = gameObject.body.position[0];
        this.position.y = this.body.position[1] = gameObject.body.position[1];

        var a = Util.Random.get() * 2 * Math.PI;
        this.body.velocity[0] = Math.sin(a) * (50 + Util.Random.get() * 150);
        this.body.velocity[1] = Math.cos(a) * (50 + Util.Random.get() * 150);

    }

    this.enable();

};

Loot.prototype.pickup = function () {

    this.state.sounds.play('pickup');
    this.disable();

};

Loot.prototype.update = function () {

    this.updatePhysics();
};

export default Loot;