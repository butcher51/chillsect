import {Mesh, MeshBasicMaterial, OctahedronGeometry} from "three";
import Loot from "./loot";
import Util from "../../../../util";

var Money = function (lootType) {

    Loot.call(this, lootType);

    this.size = 8;

    if (!Money.material) {
        Money.material = new MeshBasicMaterial({
            color: 0xffaa00
        });
        Money.geometry = new OctahedronGeometry(1);
    }

    var mesh = new Mesh(Money.geometry, Money.material);
    mesh.renderOrder = 2;

    this.scale.set(this.size, this.size, this.size);

    var mesh = new Mesh(Money.geometry, Money.material);
    mesh.renderOrder = 2;

    this.add(mesh);

};

Money.prototype = Object.create(Loot.prototype);
Money.prototype.constructor = Money;

Money.prototype.spawn = function (gameObject, type, dropOut) {

    Loot.prototype.spawn.call(this, gameObject, type, dropOut);
    this.body.angleVelocity = Util.Random.get() * 0.1;

};

Money.prototype.pickup = function () {

    this.state.console.updateMoney(++this.state.player.money);
    this.state.sounds.play('pickup');
    this.disable();

};

Money.prototype.update = function () {

    if (this.visible === false) {
        return;
    }

    this.updatePhysics();
    this.rotation.y += this.body.angleVelocity;

    this.body.velocity[0] *= 0.99;
    this.body.velocity[1] *= 0.99;


};

export default Money;