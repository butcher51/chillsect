import { Mesh, Vector3, AdditiveBlending, MeshBasicMaterial, RepeatWrapping } from 'three';
import { Circle, vec2, Body } from 'p2';
import CONFIG from '../../../../config';
import Contrail from '../contrail';
import Util from "../../../../util";

export default class Missile extends Mesh {
    public engine: any;
    public hitParticleSysType: any;
    public body: any;
    public visible: boolean;
    public renderOrder: number;
    public life: number;
    public endOfLife: any;
    public strength: any;
    public propulsionMaterial2: any;
    public propulsionMaterial: any;
    public position: Vector3;
    public contrail: Contrail;

    constructor(engine, geometry, material, hitParticleSysType, life, strength) {
        super(geometry, material);

        this.engine = engine;

        this.hitParticleSysType = hitParticleSysType;

        this.body = new Body({
            mass: 1,//strength / 5,
            position: [0, 0]
        });

        this.body.addShape(new Circle({
            radius: 20,
            collisionGroup: CONFIG.COLLISION_MASK.PROJECTILE,
            collisionMask: CONFIG.COLLISION_MASK.SPACE_OBJECT | CONFIG.COLLISION_MASK.ENEMY
        }));

        this.body.gameObject = this;

        this.visible = false;
        this.renderOrder = 2;
        this.life = 0;
        this.endOfLife = life;
        this.strength = strength;

        this.position.z = 1;


        var texture3 = this.engine.loader.resources['ship01Propulsion03texture'].texture.clone();
        texture3.needsUpdate = true;

        this.propulsionMaterial2 = new MeshBasicMaterial({
            color: 0xffffff,
            map: texture3,
            transparent: true,
            blending: AdditiveBlending,
            opacity: 1
        });

        var map3 = this.propulsionMaterial2.map;
        map3.wrapS =
            map3.wrapT =
            map3.wrapS =
            map3.wrapT = RepeatWrapping;
        map3.repeat.set(1, 1);
        map3.repeat.set(1, 1);

        var propulsion2 = new Mesh(this.engine.loader.resources['ship01Propulsion02model'].geometry, this.propulsionMaterial2);

        propulsion2.rotation.x = 90 * (Math.PI / 180);
        propulsion2.scale.set(4.5, 4.5, 7);

        super.add(propulsion2);


        propulsion2.renderOrder = 2;

        var texture2 = this.engine.loader.resources['ship01Propulsion02texture'].texture.clone();
        texture2.needsUpdate = true;

        this.propulsionMaterial = new MeshBasicMaterial({
            color: 0xffffff,
            map: texture2,
            transparent: true,
            blending: AdditiveBlending,
            opacity: 1
        });

        var map2 = this.propulsionMaterial.map;
        map2.wrapS =
            map2.wrapT =
            map2.wrapS =
            map2.wrapT = RepeatWrapping;
        map2.repeat.set(1, 1);
        map2.repeat.set(1, 1);

        var propulsion = new Mesh(this.engine.loader.resources['ship01Propulsion02model'].geometry, this.propulsionMaterial);

        propulsion.renderOrder = 3;

        propulsion.rotation.x = 90 * (Math.PI / 180);
        propulsion.position.y = 10;
        propulsion.scale.set(5, 5, 12);

        super.add(propulsion);

        this.contrail = new Contrail(this.engine, this.engine.loader.resources.contrailTexture.texture, 9);
        this.contrail.rotation.y = -90 * (Math.PI / 180);

        this.contrail.position.y = 16;
        this.contrail.position.z = 2;

        super.add(this.contrail);

    }



    public die() {

        this.life = -1;
        this.visible = false;

        var state = this.engine.states.get();
        state.particleSystems.asteroidHit(this);
        state.sounds.play('explode');

        this.body.velocity[0] = 0;
        this.body.velocity[1] = 0;

        var that = this;
        setTimeout(function () {
            that.engine.world.removeBody(that.body);
        }, 16);

        this.doAreaHit();

    };

    public doAreaHit() {

        var vb = this.engine.states.get().world.children;

        for (var k = 0, o, il = vb.length; k < il; k++) {
            o = vb[k];
            if (o.visible === true) {
                if (Util.dist2(this.body.position, o.body.position) < 20000) {
                    if (o.hit) {
                        o.hit(this);
                    }
                }

            }
        }

    };

    public onShoot() {
        this.life = 0;
        this.visible = true;
        this.engine.world.addBody(this.body);
        this.contrail.reset(this.body.position, this.body.angle, 0, this.body.velocity);
    };

    public drag = 0.99;
    public accel = 60;
    public speedLimit = 1200;


    public update() {

        if (this.life === -1) {
            return;
        }
        if (this.life > this.endOfLife) {
            this.die();
            return;
        }
        this.life++;

        this.position.x = this.body.position[0];
        this.position.y = this.body.position[1];
        this.position.z = -5;
        super.rotation.z = this.body.angle;

        this.body.velocity[0] *= this.drag;
        this.body.velocity[1] *= this.drag;

        if (this.life > 5) {

            this.body.velocity[0] += Math.cos(this.body.angle - Math.PI / 2) * this.accel;
            this.body.velocity[1] += Math.sin(this.body.angle - Math.PI / 2) * this.accel;

            if (vec2.squaredLength(this.body.velocity) > this.speedLimit * this.speedLimit) {
                vec2.normalize(this.body.velocity, this.body.velocity);
                this.body.velocity[0] *= this.speedLimit;
                this.body.velocity[1] *= this.speedLimit;
            }

            super.children[0].visible = true;
            super.children[1].visible = true;
            this.propulsionMaterial.map.offset.y -= 0.1;
            this.propulsionMaterial2.map.offset.y -= 0.2;

        } else {

            super.children[0].visible = false;
            super.children[1].visible = false;

        }

        this.contrail.update(this.body.position, this.body.angle, 0, this.body.velocity);


    };

}
