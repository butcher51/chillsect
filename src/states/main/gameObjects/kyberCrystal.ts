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
import CONFIG from "../../../config";
import Util from "../../../util";
import { Game } from "../../..";

export default class KyberCrystal extends Object3D {
    
    public static materialBuffer: MeshBasicMaterial[] = [];
    public static geometry: any;
    public static glowMat: any;
    public static glowGeo: any;
    public body: any;
    public size: number;
    public state: any;
    hp: number;

    constructor() {
        super();

        this.state = Game.engine.states.get();

        if (KyberCrystal.materialBuffer.length === 0) {
            KyberCrystal.materialBuffer[0] = new MeshBasicMaterial({
                color: 0xffffff,
                map: Game.engine.loader.resources['kyberCrystal'].texture
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
                map: Game.engine.loader.resources['kyberCrystal'].texture,
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
                map: Game.engine.loader.resources['fusionBeamEnd2Texture'].texture
            });
    
            KyberCrystal.glowGeo = new PlaneBufferGeometry(14, 8, 1, 1);
    
        }
    
        Object3D.call(this);
    
        var mesh1 = new Mesh(KyberCrystal.geometry, KyberCrystal.materialBuffer[0]);
        super.add(mesh1);
    
        var mesh2 = new Mesh(KyberCrystal.geometry, KyberCrystal.materialBuffer[1]);
        mesh2.scale.set(1.3, 1.3, 1.3);
    
        super.add(mesh2);
    
        var mesh3Wrapper = new Object3D();
    
        var mesh3 = new Mesh(KyberCrystal.glowGeo, KyberCrystal.glowMat);
    
        mesh3.renderOrder = 10;
        mesh3.position.z = 2;
    
        mesh3Wrapper.add(mesh3);
    
        mesh3Wrapper.position.z = -0.5;
    
        super.add(mesh3Wrapper);
    
        Util.lookToCam(mesh3Wrapper);
    
    
        super.visible = false;
    
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
        super.clickSize = this.size * this.size;
    
        super.scale.set(this.size, this.size, this.size * 2);

    }

    public materialBuffer = [];

    public pickup() {

        this.state.missionController.addKyberCrystal();
        this.state.sounds.play('pickup');
        this.disable();
    
    }

    public setAleas(aleas) {

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

    public color = new Color(1, 1, 1);

    public collisionMask = CONFIG.COLLISION_MASK.SPACE_OBJECT;
    
    public  aleas = [];

    public enable  () {
        if (super.visible === true) {
            return;
        }
        super.visible = true;
        Game.engine.world.addBody(this.body);
    }

    public disable  () {

        super.visible = false;
        this.hp = -1;
        Game.engine.world.removeBody(this.body);
    
    }

    public update() {

        if (super.visible === false) return;
    
        super.children[0].material.map.offset.x -= 0.001;
        // this.children[0].material.emissiveMap.offset.x -= 0.001;
    
        super.children[1].material.map.offset.x -= 0.001;
        // this.children[1].material.emissiveMap.offset.x -= 0.001;
    
        // this.children[0].material.map.offset.y -= 0.001;
        // this.children[0].material.emissiveMap.offset.y -= 0.001;
        //
        // this.children[1].material.map.offset.y -= 0.001;
        // this.children[1].material.emissiveMap.offset.y -= 0.001;
    
        super.position.x = this.body.position[0];
        super.position.y = this.body.position[1];
        super.children[0].rotation.z += 0.01;
        super.children[1].rotation.z += 0.01;
    
    }
}