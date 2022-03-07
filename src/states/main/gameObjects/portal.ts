import { AdditiveBlending, Mesh, RepeatWrapping, MeshBasicMaterial, MeshLambertMaterial, Object3D, PlaneBufferGeometry } from "three";
import TWEEN from "tween.js";
import GameObject from "../../../engine/gameobject";
import CONFIG from "../../../config";
import { Game } from "../../..";

export default class Portal extends GameObject {
    mechMat: any;
    ledMat: any;

    constructor() {
        super();

        var mesh = new Mesh(Game.engine.loader.resources['portalModel'].geometry, new MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            map: Game.engine.loader.resources['portalTexture'].texture
        }));

        mesh.rotation.x = 90 * (Math.PI / 180);
        mesh.rotation.y = 90 * (Math.PI / 180);

        mesh.position.set(0, 0, -55);
        mesh.scale.set(0.01, 0.01, 0.01);

        mesh.renderOrder = -3;

        this.add(mesh);

        var mechs = new Object3D();

        var mechMat = new MeshBasicMaterial({
            color: 0xffffff,
            map: Game.engine.loader.resources['portal2Texture'].texture
        });
        this.mechMat = mechMat;

        var s = 52;

        for (var i = 0; i < 10; i++) {
            var meshMech = new Mesh(Game.engine.loader.resources['portalModel2'].geometry, mechMat);

            meshMech.rotation.x = 90 * (Math.PI / 180);
            meshMech.rotation.y = 90 * (Math.PI / 180);

            meshMech.position.set(0, 0, -60);
            meshMech.scale.set(s, s, s);
            meshMech.rotation.y = (17 + 36 * i) * (Math.PI / 180);


            mechs.add(meshMech);
        }

        var texture = Game.engine.loader.resources['particle02'].texture.clone();
        texture.needsUpdate = true;
        texture.offset.x = 0;
        texture.offset.y = 0.25;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(0.25, 0.25);

        var mat = new MeshBasicMaterial({
            color: 0xff8888,
            map: texture,
            blending: AdditiveBlending,
            transparent: true
        });
        this.ledMat = mat;

        var led = new Mesh(new PlaneBufferGeometry(20, 20), mat);
        led.position.set(185, 60, -22);

        mechs.add(led);

        this.add(mechs);


        this.initPhysics({
            radius: 240,
            mass: 0,
            type: 2,
            collisionGroup: CONFIG.COLLISION_MASK.STATIC_OBJECT,
            collisionMask: CONFIG.COLLISION_MASK.SPACE_OBJECT
        });

        this.enablePhysics();
    }

    public size = 80;

    public out(gameObject) {

        if (this.state.missionController && this.state.missionController.complete) {
            return;
        }

        this.state.sounds.play('portal');

        var that = this;

        var t1 = new TWEEN.Tween({ s: 0.01, c: 0.2, i: 0 })
            .to({ s: that.size, c: 1, i: 0.5 }, 1.5)
            .onUpdate(function () {
                that.children[0].scale.set(this.s, this.s, this.s);
            })
            .easing(TWEEN.Easing.Quartic.Out);

        var bx = this.position.x;
        var by = this.position.y;

        gameObject.position.z = -110;
        gameObject.scale.set(0.01, 0.01, 0.01);

        var coords = { z: -110, s: 0.01, i: 0 };

        var t2 = new TWEEN.Tween(coords)
            .to({ z: 0, s: 1, i: 13 }, 1)
            .onUpdate(function () {
                gameObject.position.z = this.z;
                gameObject.scale.set(this.s, this.s, this.s);
                gameObject.rotation.z = this.i;
                var x = Math.cos(this.i) * (110 + gameObject.position.z);
                var y = Math.sin(this.i) * (110 + gameObject.position.z);
                gameObject.body.position[0] = gameObject.position.x = bx + x;
                gameObject.body.position[1] = gameObject.position.y = by + y;
                gameObject.body.velocity[0] = y * 6;
                gameObject.body.velocity[1] = x * 6;
            })
            .onComplete(function () {
                gameObject.active = true;
            })
            .easing(TWEEN.Easing.Cubic.In);

        var t3 = new TWEEN.Tween({ s: 80, c: 1, i: 0.5 })
            .to({ s: 0.01, c: 0, i: 0 }, 3.5)
            .onUpdate(function () {
                that.children[0].scale.set(this.s, this.s, this.s);
                gameObject.body.velocity[0] *= 0.98;
                gameObject.body.velocity[1] *= 0.98;
            })
            .easing(TWEEN.Easing.Quartic.In);


        t1.start(Game.engine.time);

        setTimeout(function () {
            t2.start(Game.engine.time);
        }, 1000);

        setTimeout(function () {
            t3.start(Game.engine.time);
        }, 1500);

    }

    public open() {

        this.state.sounds.play('portal');

        var that = this;

        var t1 = new TWEEN.Tween({ s: 0.01, c: 0.2, i: 0 })
            .to({ s: that.size, c: 1, i: 0.5 }, 1.5)
            .onUpdate(function () {
                that.children[0].scale.set(this.s, this.s, this.s);
            })
            .easing(TWEEN.Easing.Quartic.Out);

        t1.start(Game.engine.time);

    }

    public in(gameObject) {

        this.state.sounds.play('portal');

        gameObject.active = false;

        var coords = { z: 0, s: 1, i: -13 + Math.atan2(gameObject.body.position[0], gameObject.body.position[1]) };

        gameObject.body.velocity[0] = 0;
        gameObject.body.velocity[1] = 0;

        var bx = this.position.x;
        var by = this.position.y;

        var that = this;

        var cameraPosition = Game.engine.scene.camera.position;
        var position = this.state.starField.position;

        var t1 = new TWEEN.Tween(coords)
            .to({ z: -110, s: 0.01, i: 0 }, 1)
            .onUpdate(function () {
                gameObject.position.z = this.z;
                gameObject.scale.set(this.s, this.s, this.s);
                gameObject.rotation.z = this.i;
                var x = Math.cos(this.i) * (110 + gameObject.position.z);
                var y = Math.sin(this.i) * (110 + gameObject.position.z);
                gameObject.body.position[0] = gameObject.position.x = bx + x;
                gameObject.body.position[1] = gameObject.position.y = by + y;

                cameraPosition.x = gameObject.position.x;
                cameraPosition.y = gameObject.position.y;

                position.x = gameObject.position.x;
                position.y = gameObject.position.y;

            })
            .onComplete(function () {

                setTimeout(function () {
                    Game.engine.world.removeBody(gameObject.body);
                }, 16);
                gameObject.visible = false;

                var t2 = new TWEEN.Tween({ s: that.size })
                    .to({ s: 0.01 }, 1.5)
                    .onUpdate(function () {
                        that.children[0].scale.set(this.s, this.s, this.s);
                    })
                    .onComplete(function () {
                        setTimeout(function () {
                            Game.engine.pause();
                            that.state.controlPanel.showLevelComplete();
                        }, 300);
                    })
                    .easing(TWEEN.Easing.Quartic.In);

                t2.start(Game.engine.time);


            })
            .easing(TWEEN.Easing.Cubic.Out);

        t1.start(Game.engine.time);

        console.log('portal IN');

    }

    public update = function () {

        this.children[0].rotation.y += 0.05;
        this.children[1].rotation.z += 0.003;
        this.ledMat.opacity = Math.sin(Game.engine.time * 4);

    };
}

