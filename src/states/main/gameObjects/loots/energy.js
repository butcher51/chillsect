import {AdditiveBlending, Mesh, MeshBasicMaterial, PlaneBufferGeometry} from 'three';
import Loot from './loot.js';
import CONFIG from '../../../../config.js';
import Util from '../../../../util.js';

class PowerupEnergy extends Loot {
    constructor(lootType) {

        super(lootType);

        var material = new MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            blending: AdditiveBlending,
            map: this.engine.loader.resources['powerupEnergyTexture'].texture
        });

        var geometry = new PlaneBufferGeometry(this.size, this.size, 1, 1);

        var mesh = new Mesh(geometry, material);
        mesh.renderOrder = 2;

        Util.lookToCam(mesh);

        this.add(mesh);

    }

    pickup() {

        this.state.ship.addEnergy(CONFIG.ENERGY_MANAGEMENT.POWERUP_ENERGY);
        this.state.sounds.play('powerup');
        this.disable();

    }
}

export default PowerupEnergy;
