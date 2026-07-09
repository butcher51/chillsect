import {
    AdditiveBlending,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    OctahedronGeometry,
    PlaneBufferGeometry,
    RepeatWrapping
} from "three";
import {Body, Circle} from "p2";
import CONFIG from "../../../config.js";
import Util from "../../../util.js";

class KyberCrystal extends Object3D {
    static materialBuffer = [];

    color = new Color(1, 1, 1);
    collisionMask = CONFIG.COLLISION_MASK.SPACE_OBJECT;
    aleas = [];

    constructor() {
        super();

        this.engine = window.game.engine;
        this.state = this.engine.states.get();

        if (KyberCrystal.materialBuffer.length === 0) {
            KyberCrystal.materialBuffer[0] = new MeshBasicMaterial({
                color: 0xffffff,
                map: this.engine.loader.resources['kyberCrystal'].texture
            });

            var map1 = KyberCrystal.materialBuffer[0].map;
            map1.wrapS =
                map1.wrapT = RepeatWrapping;
            map1.repeat.set(1, 1);
            map1.repeat.set(1, 1);

            // map1 = KyberCrystal.materialBuffer[0].emissiveMap;
            // map1.wrapS =
            //     map1.wrapT = RepeatWrapping;
            // map1.repeat.set(1, 1);
            // map1.repeat.set(1, 1);


            KyberCrystal.materialBuffer[1] = new MeshBasicMaterial({
                color: 0xffffff,
                map: this.engine.loader.resources['kyberCrystal'].texture,
                transparent: true,
                side: DoubleSide,
                blending: AdditiveBlending,
            });

            map1 = KyberCrystal.materialBuffer[1].map;
            map1.wrapS =
                map1.wrapT = RepeatWrapping;
            map1.repeat.set(1, 1);
            map1.repeat.set(1, 1);

            // map1 = KyberCrystal.materialBuffer[1].emissiveMap;
            // map1.wrapS =
            //     map1.wrapT = RepeatWrapping;
            // map1.repeat.set(1, 1);
            // map1.repeat.set(1, 1);

            KyberCrystal.geometry = new OctahedronGeometry(1);

            KyberCrystal.glowMat = new MeshBasicMaterial({
                color: 0x0044ff,
                transparent: true,
                opacity: 0.5,
                blending: AdditiveBlending,
                map: this.engine.loader.resources['fusionBeamEnd2Texture'].texture
            });

            KyberCrystal.glowGeo = new PlaneBufferGeometry(14, 8, 1, 1);

        }

        var mesh1 = new Mesh(KyberCrystal.geometry, KyberCrystal.materialBuffer[0]);
        this.add(mesh1);

        var mesh2 = new Mesh(KyberCrystal.geometry, KyberCrystal.materialBuffer[1]);
        mesh2.scale.set(1.3, 1.3, 1.3);

        this.add(mesh2);

        var mesh3Wrapper = new Object3D();

        var mesh3 = new Mesh(KyberCrystal.glowGeo, KyberCrystal.glowMat);

        mesh3.renderOrder = 10;
        mesh3.position.z = 2;

        mesh3Wrapper.add(mesh3);

        mesh3Wrapper.position.z = -0.5;

        this.add(mesh3Wrapper);

        Util.lookToCam(mesh3Wrapper);


        this.visible = false;

        var shape = new Circle({radius: 40});
        shape.collisionGroup = CONFIG.COLLISION_MASK.LOOT;
        shape.collisionMask = CONFIG.COLLISION_MASK.SHIP | CONFIG.COLLISION_MASK.SPACE_OBJECT;
        this.body = new Body({
            mass: 0.1,
            type: Body.DYNAMIC,
            position: [0, 0]
        });
        this.body.addShape(shape);
        this.body.gameObject = this;

        this.size = 25;
        this.clickSize = this.size * this.size;

        this.scale.set(this.size, this.size, this.size * 2);

    }

    pickup() {

        this.state.missionController.addKyberCrystal();
        this.state.sounds.play('pickup');
        this.disable();

    }

    setAleas(aleas) {

        // 0:x
        // 1:y
        // 2:visibleFlag
        // 3:type
        // 4:hp
        // 5:size
        // 6,7,8,9,10,11,12,13,14,15

        this.aleas = aleas.slice();

        if (this.aleas[4] >= 0) {
            this.enable();
            this.hp = this.aleas[4];
        } else {
            this.disable();
            this.hp = -1;
        }
    }

    enable() {
        if (this.visible === true) {
            return;
        }
        this.visible = true;
        this.engine.world.addBody(this.body);
    }

    disable() {

        this.visible = false;
        this.hp = -1;
        this.engine.world.removeBody(this.body);

    }

    update() {


        if (this.visible === false) return;

        this.children[0].material.map.offset.x -= 0.001;
        // this.children[0].material.emissiveMap.offset.x -= 0.001;

        this.children[1].material.map.offset.x -= 0.001;
        // this.children[1].material.emissiveMap.offset.x -= 0.001;

        // this.children[0].material.map.offset.y -= 0.001;
        // this.children[0].material.emissiveMap.offset.y -= 0.001;
        //
        // this.children[1].material.map.offset.y -= 0.001;
        // this.children[1].material.emissiveMap.offset.y -= 0.001;

        this.position.x = this.body.position[0];
        this.position.y = this.body.position[1];
        this.children[0].rotation.z += 0.01;
        this.children[1].rotation.z += 0.01;


    }
}

export default KyberCrystal;
