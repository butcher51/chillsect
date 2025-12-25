import GameObject from "../../../../engine/gameobject";
import Money from "./money";
import PowerupEnergy from "./energy";

var classes = {
    Money: Money,
    PowerupEnergy: PowerupEnergy
};

var Loots = function () {

    GameObject.call(this);

};

Loots.prototype = Object.create(GameObject.prototype);
Loots.prototype.constructor = Loots;

Loots.prototype.spawn = function (gameObject, type, dropOut) {

    var loot = new classes[type.class](type);

    this.add(loot);

    loot.spawn(gameObject, type, dropOut);

    if (this.children.length > 30) {
        this.children[0].disable();
        this.remove(this.children[0]);
    }

};

Loots.prototype.update = function () {

    for (var i = 0, il = this.children.length; i < il; i++) {
        if (this.children[i].visible === true) {
            this.children[i].update();
        }
    }

};

export default Loots;
