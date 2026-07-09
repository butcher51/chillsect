import GameObject from "../../../../engine/gameobject.js";
import Money from "./money.js";
import PowerupEnergy from "./energy.js";

var classes = {
    Money: Money,
    PowerupEnergy: PowerupEnergy
};

class Loots extends GameObject {
    constructor() {

        super();

    }

    spawn(gameObject, type, dropOut) {

        var loot = new classes[type.class](type);

        this.add(loot);

        loot.spawn(gameObject, type, dropOut);

        if (this.children.length > 30) {
            this.children[0].disable();
            this.remove(this.children[0]);
        }

    }

    update() {

        for (var i = 0, il = this.children.length; i < il; i++) {
            if (this.children[i].visible === true) {
                this.children[i].update();
            }
        }

    }
}

export default Loots;
