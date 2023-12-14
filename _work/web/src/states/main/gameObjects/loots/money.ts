import { Mesh, MeshBasicMaterial, OctahedronGeometry } from "three";
import Loot from "./loot";
import Util from "../../../../util";

export default class Money extends Loot {
    static material: any;
    static geometry: any;

    constructor(lootType) {
        super(lootType);

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
    }

    public spawn(gameObject, type, dropOut) {

        super.spawn(gameObject, type, dropOut);
        this.body.angleVelocity = Util.Random.get() * 0.1;

    }
    public pickup() {

        this.state.console.updateMoney(++this.state.player.money);
        this.state.sounds.play('pickup');
        this.disable();

    }

    public update() {

        if (this.visible === false) {
            return;
        }

        this.updatePhysics();
        this.rotation.y += this.body.angleVelocity;

        this.body.velocity[0] *= 0.99;
        this.body.velocity[1] *= 0.99;

    }
}