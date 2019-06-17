import {AdditiveBlending, Audio, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, RepeatWrapping} from 'three';
import {vec2} from 'p2';
import CONFIG from '../../../config';
import GameObject from '../../../engine/gameobject';
import Util from '../../../util';
import Contrail from './contrail';

var Ship = function () {

    GameObject.call(this);

    this.create();

};

Ship.prototype = Object.create(GameObject.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.accel = 30;
Ship.prototype.drag = 0.98;
Ship.prototype.speedLimit = 660;
Ship.prototype.size = 30;
Ship.prototype.lastModelRotation = 0;

Ship.prototype.shootBlockTimeout = 0.1;

Ship.prototype.energy = CONFIG.ENERGY_MANAGEMENT.ENERGY_MAX_VALUE;
Ship.prototype.plutonium = CONFIG.ENERGY_MANAGEMENT.PLUTONIUM_MAX_VALUE;

Ship.prototype.active = false;
Ship.prototype.dead = false;
Ship.prototype.inContact = false;
Ship.prototype.controlBlock = false;

Ship.prototype.create = function () {

    this.warpperObj = new Object3D();

    this.add(this.warpperObj);

    this.shipMaterial = new MeshBasicMaterial({
        color: 0xffffff,
        map: this.engine.loader.resources['ship01texture'].texture
    });

    var shipModel = new Mesh(this.engine.loader.resources['ship01model'].geometry, this.shipMaterial);

    shipModel.scale.set(this.size, this.size, this.size);
    shipModel.rotation.x = 90 * (Math.PI / 180);
    shipModel.rotation.y = 90 * (Math.PI / 180);
    shipModel.position.x = this.size / 2;

    this.warpperObj.add(shipModel);

    this.controlFlags = this.engine.controls.getControlFlags();

    this.initPropulsion(shipModel);

    this.initContrail();

    this.initShield();

    this.initPhysics({
        radius: 35,
        mass: 30,
        collisionGroup: CONFIG.COLLISION_MASK.SHIP,
        collisionMask: CONFIG.COLLISION_MASK.SPACE_OBJECT | CONFIG.COLLISION_MASK.LOOT | CONFIG.COLLISION_MASK.ENEMY
    });

    var that = this;
    window.teleport = function (x, y) {
        that.body.position[0] = x * CONFIG.PROCEDURAL_BLOCK_SIZE;
        that.body.position[1] = y * CONFIG.PROCEDURAL_BLOCK_SIZE;
    };

    this.initSounds();

    //
    // var plane = new Mesh(new PlaneBufferGeometry(500,500,1,1),new MeshBasicMaterial({depthWrite: false,color:0xff0000,opacity:0.8,transparent:true}));
    // this.warpperObj.add(plane);


};

Ship.prototype.initSounds = function () {

    this.sounds = {};

    var sound = new Audio(this.engine.audioListener);
    sound.setBuffer(this.engine.loader.resources['shipEngine'].buffer);
    sound.setLoop(true);

    this.sounds.engine = sound;

    sound = new Audio(this.engine.audioListener);
    sound.setBuffer(this.engine.loader.resources['energyShield'].buffer);
    sound.setLoop(true);

    this.sounds.energyShield = sound;

    sound = new Audio(this.engine.audioListener);
    sound.setBuffer(this.engine.loader.resources['shipExplode'].buffer);

    this.sounds.explode = sound;

    sound = new Audio(this.engine.audioListener);
    sound.setBuffer(this.engine.loader.resources['asteroidImpact1Sound'].buffer);

    this.sounds.impact = sound;

    var energyDown = new Audio(this.engine.audioListener);
    energyDown.setBuffer(this.engine.loader.resources['energyDown'].buffer);

    this.sounds.energyDown = energyDown;

};

Ship.prototype.spendEnergy = function (amount) {

    if (this.engine.sound && this.energy > CONFIG.ENERGY_MANAGEMENT.WARNING && this.energy - amount < CONFIG.ENERGY_MANAGEMENT.WARNING) {
        this.state.sounds.play('warning1');
    }

    if (this.energy - amount < CONFIG.ENERGY_MANAGEMENT.MIN_VALUE) {
        this.energy = CONFIG.ENERGY_MANAGEMENT.MIN_VALUE;
    } else {
        this.energy -= amount;
    }

    if (this.energy === CONFIG.ENERGY_MANAGEMENT.MIN_VALUE) {
        if (this.sounds.energyDown.isPlaying === false) {
            this.sounds.energyDown.play();
        }
    }
};

Ship.prototype.collide = function (amount, collideVelocity) {

    if (this.dead === true) {
        return;
    }
    if (!amount) {
        amount = CONFIG.ENERGY_MANAGEMENT.SHIP_IMPACT_WITH_ASTEROID;
    }
    this.shield.visible = true;
    this.shield.children[0].material.opacity = 1;


    if (this.engine.sound) {
        if (this.sounds.energyShield.isPlaying === false) {
            this.sounds.energyShield.play();
        }
        this.sounds.energyShield.gain.gain.value = 1;
    }

    if (collideVelocity) {
        amount *= (collideVelocity / 5000);
    }

    this.spendEnergy(amount);

    if (this.state.console) {
        this.state.console.update(this, true);
    }

    if (this.energy === CONFIG.ENERGY_MANAGEMENT.MIN_VALUE) {
        this.die();
    }

};

Ship.prototype.beginContact = function (amount, collideVelocity) {

    if (!this.active) return;

    this.collide(amount, collideVelocity);

    this.inContact = true;

};

Ship.prototype.endContact = function () {

    if (!this.active) return;

    this.inContact = false;

};

Ship.prototype.die = function () {

    if (this.dead === true) {
        return;
    }
    this.dead = true;
    this.shield.visible = false;
    this.state.particleSystems.explodeShip(this);

    if (this.engine.sound) {
        this.sounds.impact.play();
    }

    setTimeout(this.dieStep2.bind(this), 300);

    setTimeout(this.respawn.bind(this), 3000);

};

Ship.prototype.dieStep2 = function () {
    this.warpperObj.visible = false;
    if (this.engine.sound) {
        this.sounds.explode.play();
    }
};

Ship.prototype.respawn = function () {


    this.body.position[0] = this.body.position[1] = this.body.velocity[0] = this.body.velocity[1] = this.position.x = this.position.y = 0;
    this.position.z = -10000;

    this.warpperObj.visible = true;

    this.dead = false;

    this.state.portal.out(this);

    this.energy = CONFIG.ENERGY_MANAGEMENT.ENERGY_MAX_VALUE;

    setTimeout(() => {
        this.state.weapons.enabled = true;
    }, 2400);
};

Ship.prototype.initShield = function () {

    var material = {
        color: 0xffffff,
        map: this.engine.loader.resources['ship01shield01'].texture,
        transparent: true,
        blending: AdditiveBlending,
        opacity: 1
    };

    var geometry = new PlaneBufferGeometry(this.size * 3, this.size * 3);

    this.shield = new Object3D();
    this.shield.visible = false;

    var shieldMesh = new Mesh(geometry, new MeshBasicMaterial(material));

    shieldMesh.renderOrder = 2;

    this.shield.add(shieldMesh);

    shieldMesh.position.z = 100;

    Util.lookToCam(this.shield);
    this.engine.scene.scene.add(this.shield);

};

Ship.prototype.addEnergy = function (amount) {

    this.energy += amount;

    if (this.energy > CONFIG.ENERGY_MANAGEMENT.ENERGY_MAX_VALUE) {
        this.energy = CONFIG.ENERGY_MANAGEMENT.ENERGY_MAX_VALUE;
    }

    if (this.state.console) {
        this.state.console.update(this, true);
    }

};

Ship.prototype.updateShield = function () {

    if (this.dead === true) {
        this.shield.visible = false;
        return;
    }

    this.shield.position.x = this.body.position[0];
    this.shield.position.y = this.body.position[1];

    if (this.shield.visible) {
        var material = this.shield.children[0].material;
        material.opacity -= 0.02;
        if (material.opacity < 0.02) {
            this.shield.visible = false;
            material.opacity = 1;
        }
    }

};

Ship.prototype.initContrail = function () {

    this.contrailL = new Contrail(this.engine, this.engine.loader.resources.contrailTexture.texture, 9);

    this.contrailL.position.x = -30;
    this.contrailL.position.z = 2;
    this.contrailL.position.y = -9;

    this.warpperObj.add(this.contrailL);

    this.contrailR = new Contrail(this.engine, this.engine.loader.resources.contrailTexture.texture, 9);

    this.contrailR.position.x = -30;
    this.contrailR.position.z = 2;
    this.contrailR.position.y = 9;

    this.warpperObj.add(this.contrailR);


};


Ship.prototype.velocityNull = [0, 0];

Ship.prototype.updateContrail = function () {

    this.contrailL.update(this.body.position, this.body.angle, this.warpperObj.children[0].rotation.x,
        this.active === true ? this.body.velocity : this.velocityNull
    );

    this.contrailR.update(this.body.position, this.body.angle, this.warpperObj.children[0].rotation.x,
        this.active === true ? this.body.velocity : this.velocityNull
    );

};

Ship.prototype.initPropulsion = function (shipModel) {


    var materialOptions0 = {
        color: 0xffffff,
        map: this.engine.loader.resources['ship01Propulsion03texture'].texture,
        transparent: true,
        blending: AdditiveBlending,
        opacity: 0
    };

    var propulsion0ModelLeft = new Mesh(this.engine.loader.resources['ship01Propulsion01model'].geometry, new MeshBasicMaterial(materialOptions0));
    var propulsion0ModelRight = new Mesh(this.engine.loader.resources['ship01Propulsion01model'].geometry, new MeshBasicMaterial(materialOptions0));

    propulsion0ModelLeft.rotation.z = propulsion0ModelRight.rotation.z = 90 * (Math.PI / 180);
    propulsion0ModelLeft.scale.set(0.24, 0.24, 0.23);
    propulsion0ModelRight.scale.set(0.24, 0.24, 0.23);

    propulsion0ModelLeft.position.set(0.311, 0.088, -1);
    propulsion0ModelRight.position.set(-0.311, 0.088, -1);

    shipModel.add(propulsion0ModelLeft);
    shipModel.add(propulsion0ModelRight);

    this.propulsion0ModelLeftMat = propulsion0ModelLeft.material;
    this.propulsion0ModelRightMat = propulsion0ModelRight.material;

    /***
     *
     *
     *
     *
     */

    var materialOptions1 = {
        color: 0xffffff,
        map: this.engine.loader.resources['ship01Propulsion01texture'].texture,
        transparent: true,
        blending: AdditiveBlending,
        opacity: 0
    };

    var propulsion1ModelLeft = new Mesh(this.engine.loader.resources['ship01Propulsion02model'].geometry, new MeshBasicMaterial(materialOptions1));
    var propulsion1ModelRight = new Mesh(this.engine.loader.resources['ship01Propulsion02model'].geometry, new MeshBasicMaterial(materialOptions1));

    propulsion1ModelLeft.rotation.z = propulsion1ModelRight.rotation.z = 90 * (Math.PI / 180);
    propulsion1ModelLeft.scale.set(0.16, 0.16, 0.01);
    propulsion1ModelRight.scale.set(0.16, 0.16, 0.01);

    var map1 = propulsion1ModelLeft.material.map;
    map1.wrapS =
        map1.wrapT =
            map1.wrapS =
                map1.wrapT = RepeatWrapping;
    map1.repeat.set(1, 1);
    map1.repeat.set(1, 1);

    propulsion1ModelLeft.position.set(0.311, 0.086, -1.4);
    propulsion1ModelRight.position.set(-0.311, 0.086, -1.4);

    shipModel.add(propulsion1ModelLeft);
    shipModel.add(propulsion1ModelRight);

    this.propulsion1ModelLeft = propulsion1ModelLeft;
    this.propulsion1ModelRight = propulsion1ModelRight;
    this.propulsion1ModelLeftMat = propulsion1ModelLeft.material;
    this.propulsion1ModelRightMat = propulsion1ModelRight.material;

    /***
     *
     *
     *
     *
     */

    var materialOptions2 = {
        color: 0xffffff,
        map: this.engine.loader.resources['ship01Propulsion02texture'].texture,
        transparent: true,
        blending: AdditiveBlending,
        opacity: 0
    };

    var propulsion2ModelLeft = new Mesh(this.engine.loader.resources['ship01Propulsion02model'].geometry, new MeshBasicMaterial(materialOptions2));
    var propulsion2ModelRight = new Mesh(this.engine.loader.resources['ship01Propulsion02model'].geometry, new MeshBasicMaterial(materialOptions2));

    propulsion2ModelLeft.rotation.z = propulsion2ModelRight.rotation.z = 90 * (Math.PI / 180);
    propulsion2ModelLeft.scale.set(0.24, 0.24, 0.01);
    propulsion2ModelRight.scale.set(0.24, 0.24, 0.01);

    var map2 = propulsion2ModelLeft.material.map;
    map2.wrapS =
        map2.wrapT =
            map2.wrapS =
                map2.wrapT = RepeatWrapping;
    map2.repeat.set(1, 1);
    map2.repeat.set(1, 1);

    propulsion2ModelLeft.position.set(0.311, 0.086, -1.4);
    propulsion2ModelRight.position.set(-0.311, 0.086, -1.4);

    shipModel.add(propulsion2ModelLeft);
    shipModel.add(propulsion2ModelRight);

    this.propulsion2ModelLeft = propulsion2ModelLeft;
    this.propulsion2ModelRight = propulsion2ModelRight;
    this.propulsion2ModelLeftMat = propulsion2ModelLeft.material;
    this.propulsion2ModelRightMat = propulsion2ModelRight.material;

};

Ship.prototype.controlMode = 1;
// Ship.prototype.targetRotation = 0;

Ship.prototype.update = function () {

    if (this.active === true) {

        if (this.dead === false) {

            var a1 = Util.radToAngle(this.body.angle);

            // var a3 = 0;
            // if (this.controlMode === 3) {
            //     if (this.controlFlags.keyLeft === true) {
            //         this.targetRotation += 0.2;
            //     } else if (this.controlFlags.keyRight === true) {
            //         this.targetRotation -= 0.2;
            //     }
            //     if (this.controlFlags.keyDown === true) {
            //         this.targetRotation -= 0.3;
            //     }
            //     a3 = this.targetRotation;
            // } else {
            //     a3 = Util.v2ToRad(this.controlFlags.mouse.x, this.controlFlags.mouse.y);
            // }

            var a3 = Util.v2ToRad(this.controlFlags.mouse.x, this.controlFlags.mouse.y);

            var a2 = Util.radToAngle(a3);
            var shipModel = this.warpperObj.children[0];

            this.body.angle = Util.angleToRad(Util.lerpAngle(a1, a2, 0.15));
            shipModel.rotation.x = Util.angleToRad(a1 - a2) + Math.PI / 2;

            if (Math.abs(this.lastModelRotation - shipModel.rotation.x) > 0.001) {
                a1 = Util.normalizeAngle(shipModel.rotation.x);
                if (a1 < 1.57) {
                    this.propulsion0ModelRightMat.opacity =
                        this.propulsion1ModelRightMat.opacity =
                            this.propulsion2ModelRightMat.opacity = 0.6 + Util.Random.get();
                    this.propulsion1ModelRight.scale.z = .04;
                    this.propulsion2ModelRight.scale.z = .12;
                    this.propulsion1ModelRightMat.map.offset.y -= 0.05;
                    this.propulsion2ModelRightMat.map.offset.y -= 0.03;
                } else if (a1 > 1.58) {
                    this.propulsion0ModelLeftMat.opacity =
                        this.propulsion1ModelLeftMat.opacity =
                            this.propulsion2ModelLeftMat.opacity = 0.6 + Util.Random.get();
                    this.propulsion1ModelLeft.scale.z = .04;
                    this.propulsion2ModelLeft.scale.z = .12;
                    this.propulsion1ModelLeftMat.map.offset.y -= 0.05;
                    this.propulsion2ModelLeftMat.map.offset.y -= 0.03;
                }

            }
            this.lastModelRotation = shipModel.rotation.x;

            if (this.controlMode === 1) {

                if (this.controlFlags.space === true || this.controlFlags.wheel === true) {
                    this.state.weapons.shootSecondary();
                }

                if (this.controlFlags.mouseButton1 === true) {
                    this.state.weapons.shoot();
                }

                if ((this.controlFlags.mouseButton3 === true
                        || this.controlFlags.ctrl === true
                    )
                    && this.energy > CONFIG.ENERGY_MANAGEMENT.MIN_VALUE
                ) {

                    if (this.controlBlock === false) {
                        this.body.velocity[0] += Math.cos(a3) * this.accel;// * mouseVectorLen;
                        this.body.velocity[1] += Math.sin(a3) * this.accel;// * mouseVectorLen;

                        if (vec2.squaredLength(this.body.velocity) > this.speedLimit * this.speedLimit) {
                            vec2.normalize(this.body.velocity, this.body.velocity);
                            this.body.velocity[0] *= this.speedLimit;
                            this.body.velocity[1] *= this.speedLimit;
                        }
                    }
                    this.propulsion0ModelLeftMat.opacity =
                        this.propulsion0ModelRightMat.opacity =
                            this.propulsion1ModelLeftMat.opacity =
                                this.propulsion1ModelRightMat.opacity =
                                    this.propulsion2ModelLeftMat.opacity =
                                        this.propulsion2ModelRightMat.opacity = 1;//0.5 + Random.get();

                    this.propulsion1ModelLeft.scale.z =
                        this.propulsion1ModelRight.scale.z = .13;

                    this.propulsion2ModelLeft.scale.z =
                        this.propulsion2ModelRight.scale.z = .30;

                    this.propulsion1ModelLeftMat.map.offset.y -= 0.05;
                    this.propulsion1ModelRightMat.map.offset.y -= 0.05;
                    this.propulsion2ModelLeftMat.map.offset.y -= 0.07;
                    this.propulsion2ModelRightMat.map.offset.y -= 0.07;

                    if (this.engine.sound) {
                        if (this.sounds.engine.isPlaying === false) {
                            this.sounds.engine.play();
                            this.sounds.engine.gain.gain.value = 0;
                        } else {
                            if (this.sounds.engine.gain.gain.value <= 1) {
                                this.sounds.engine.gain.gain.value += 0.1;
                            }
                        }
                    }

                    this.spendEnergy(CONFIG.ENERGY_MANAGEMENT.MOVE_ENERGY_USAGE);

                } else {

                    if (this.sounds.engine.isPlaying === true) {
                        this.sounds.engine.gain.gain.value -= 0.025;
                        if (this.sounds.engine.gain.gain.value < 0.01) {
                            this.sounds.engine.pause();
                        }
                    }

                    if (this.propulsion0ModelLeftMat.opacity > 0) {
                        this.propulsion0ModelLeftMat.opacity -= 0.02;
                        this.propulsion1ModelLeftMat.opacity -= 0.03;
                        this.propulsion2ModelLeftMat.opacity -= 0.03;
                        this.propulsion1ModelLeft.scale.z -= 0.005;
                        this.propulsion2ModelLeft.scale.z -= 0.005;
                    } else {
                        this.propulsion0ModelLeftMat.opacity = 0;
                        this.propulsion1ModelLeftMat.opacity = 0;
                        this.propulsion2ModelLeftMat.opacity = 0;
                        this.propulsion1ModelLeft.scale.z =
                            this.propulsion2ModelLeft.scale.z = 0.001;
                    }

                    if (this.propulsion0ModelRightMat.opacity > 0) {
                        this.propulsion0ModelRightMat.opacity -= 0.02;
                        this.propulsion1ModelRightMat.opacity -= 0.03;
                        this.propulsion2ModelRightMat.opacity -= 0.03;
                        this.propulsion1ModelRight.scale.z -= 0.005;
                        this.propulsion2ModelRight.scale.z -= 0.005;
                    } else {
                        this.propulsion0ModelRightMat.opacity = 0;
                        this.propulsion1ModelRightMat.opacity = 0;
                        this.propulsion2ModelRightMat.opacity = 0;
                        this.propulsion1ModelRight.scale.z =
                            this.propulsion2ModelRight.scale.z = 0.001;
                    }

                    this.body.velocity[0] *= this.drag;
                    this.body.velocity[1] *= this.drag;

                }

            }
            // if (this.controlMode === 2) {
            //
            //     if (this.controlFlags.mouseButton3 === true) {
            //         this.state.weapons.shootSecondary();
            //     }
            //
            //     var shoot = false;
            //     if (
            //         this.controlFlags.mouseButton1 === true &&
            //         this.energy > CONFIG.ENERGY_MANAGEMENT.MIN_VALUE &&
            //         this.engine.time - this.controlFlags.mouseDownTime < this.shootBlockTimeout
            //     ) {
            //         var vb = this.state.world.children;
            //         var vk = [];
            //         vk[0] = this.body.position[0] + this.controlFlags.mouse.x;
            //         vk[1] = this.body.position[1] + this.controlFlags.mouse.y;
            //         for (var k = 0, d, a, o, il = vb.length; k < il; k++) {
            //             o = vb[k];
            //             if (o.visible === true) {
            //                 d = Util.dist2(vk, o.body.position);
            //                 if (o.collisionMask === CONFIG.COLLISION_MASK.ENEMY) {
            //                     a = 20;
            //                     if (d < 800 * 800) {
            //                         a = Util.radToAngle(Util.v2ToRad(
            //                             o.body.position[0] - this.body.position[0],
            //                             o.body.position[1] - this.body.position[1]));
            //                         a = Math.abs(Util.angleDiff(a, a2));
            //                         if (d < o.clickSize || a < 20) {
            //                             shoot = true;
            //                             this.state.weapons.shoot(o);
            //                             this.controlFlags.mouseDownTime = this.engine.time;
            //                             break;
            //                         }
            //                     }
            //                 } else {
            //                     if (d < o.clickSize) {
            //                         shoot = true;
            //                         this.state.weapons.shoot(o);
            //                         this.controlFlags.mouseDownTime = this.engine.time;
            //                         break;
            //                     }
            //                 }
            //             }
            //         }
            //         // if (this.controlFlags.ctrl === true) {
            //         //     shoot = true;
            //         //     this.state.weapons.shoot({position:{x:vk[0],y:vk[1]},size:1});
            //         // }
            //     }
            //
            //     if (!shoot && this.controlFlags.mouseButton1 === true) {
            //
            //         if (this.controlBlock === false) {
            //             this.body.velocity[0] += Math.cos(a3) * this.accel;// * mouseVectorLen;
            //             this.body.velocity[1] += Math.sin(a3) * this.accel;// * mouseVectorLen;
            //
            //             if (vec2.squaredLength(this.body.velocity) > this.speedLimit * this.speedLimit) {
            //                 vec2.normalize(this.body.velocity, this.body.velocity);
            //                 this.body.velocity[0] *= this.speedLimit;
            //                 this.body.velocity[1] *= this.speedLimit;
            //             }
            //         }
            //
            //         this.propulsion0ModelLeftMat.opacity =
            //             this.propulsion0ModelRightMat.opacity =
            //                 this.propulsion1ModelLeftMat.opacity =
            //                     this.propulsion1ModelRightMat.opacity =
            //                         this.propulsion2ModelLeftMat.opacity =
            //                             this.propulsion2ModelRightMat.opacity = 1;//0.5 + Random.get();
            //
            //         this.propulsion1ModelLeft.scale.z =
            //             this.propulsion1ModelRight.scale.z = .13;
            //
            //         this.propulsion2ModelLeft.scale.z =
            //             this.propulsion2ModelRight.scale.z = .30;
            //
            //         this.propulsion1ModelLeftMat.map.offset.y -= 0.05;
            //         this.propulsion1ModelRightMat.map.offset.y -= 0.05;
            //         this.propulsion2ModelLeftMat.map.offset.y -= 0.07;
            //         this.propulsion2ModelRightMat.map.offset.y -= 0.07;
            //
            //         if (this.engine.sound) {
            //             if (this.sounds.engine.isPlaying === false) {
            //                 this.sounds.engine.play();
            //                 this.sounds.engine.gain.gain.value = 0;
            //             } else {
            //                 if (this.sounds.engine.gain.gain.value <= 1) {
            //                     this.sounds.engine.gain.gain.value += 0.1;
            //                 }
            //             }
            //         }
            //
            //     } else {
            //
            //         if (this.sounds.engine.isPlaying === true) {
            //             this.sounds.engine.gain.gain.value -= 0.025;
            //             if (this.sounds.engine.gain.gain.value < 0.01) {
            //                 this.sounds.engine.pause();
            //             }
            //         }
            //
            //         if (this.propulsion0ModelLeftMat.opacity > 0) {
            //             this.propulsion0ModelLeftMat.opacity -= 0.02;
            //             this.propulsion1ModelLeftMat.opacity -= 0.03;
            //             this.propulsion2ModelLeftMat.opacity -= 0.03;
            //             this.propulsion1ModelLeft.scale.z -= 0.005;
            //             this.propulsion2ModelLeft.scale.z -= 0.005;
            //         } else {
            //             this.propulsion0ModelLeftMat.opacity = 0;
            //             this.propulsion1ModelLeftMat.opacity = 0;
            //             this.propulsion2ModelLeftMat.opacity = 0;
            //             this.propulsion1ModelLeft.scale.z =
            //                 this.propulsion2ModelLeft.scale.z = 0.001;
            //         }
            //
            //         if (this.propulsion0ModelRightMat.opacity > 0) {
            //             this.propulsion0ModelRightMat.opacity -= 0.02;
            //             this.propulsion1ModelRightMat.opacity -= 0.03;
            //             this.propulsion2ModelRightMat.opacity -= 0.03;
            //             this.propulsion1ModelRight.scale.z -= 0.005;
            //             this.propulsion2ModelRight.scale.z -= 0.005;
            //         } else {
            //             this.propulsion0ModelRightMat.opacity = 0;
            //             this.propulsion1ModelRightMat.opacity = 0;
            //             this.propulsion2ModelRightMat.opacity = 0;
            //             this.propulsion1ModelRight.scale.z =
            //                 this.propulsion2ModelRight.scale.z = 0.001;
            //         }
            //
            //         this.body.velocity[0] *= this.drag;
            //         this.body.velocity[1] *= this.drag;
            //
            //     }
            // }
            // if (this.controlMode === 3) {
            //
            //     var a4 = Util.radToAngle(this.body.angle);
            //     var a5 = this.body.angle;
            //
            //     if (this.energy > CONFIG.ENERGY_MANAGEMENT.MIN_VALUE && this.controlFlags.keyUp === true) {
            //         if (this.controlBlock === false) {
            //
            //             this.body.velocity[0] += Math.cos(a5) * this.accel;// * mouseVectorLen;
            //             this.body.velocity[1] += Math.sin(a5) * this.accel;// * mouseVectorLen;
            //
            //             if (vec2.squaredLength(this.body.velocity) > this.speedLimit * this.speedLimit) {
            //                 vec2.normalize(this.body.velocity, this.body.velocity);
            //                 this.body.velocity[0] *= this.speedLimit;
            //                 this.body.velocity[1] *= this.speedLimit;
            //             }
            //
            //             if (this.engine.sound) {
            //                 if (this.sounds.engine.isPlaying === false) {
            //                     this.sounds.engine.play();
            //                     this.sounds.engine.gain.gain.value = 0;
            //                 } else {
            //                     if (this.sounds.engine.gain.gain.value <= 1) {
            //                         this.sounds.engine.gain.gain.value += 0.1;
            //                     }
            //                 }
            //             }
            //
            //             this.spendEnergy(CONFIG.ENERGY_MANAGEMENT.MOVE_ENERGY_USAGE);
            //         }
            //     } else {
            //
            //         if (this.sounds.engine.isPlaying === true) {
            //             this.sounds.engine.gain.gain.value -= 0.025;
            //             if (this.sounds.engine.gain.gain.value < 0.01) {
            //                 this.sounds.engine.pause();
            //             }
            //         }
            //
            //         if (this.propulsion0ModelLeftMat.opacity > 0) {
            //             this.propulsion0ModelLeftMat.opacity -= 0.02;
            //             this.propulsion1ModelLeftMat.opacity -= 0.03;
            //             this.propulsion2ModelLeftMat.opacity -= 0.03;
            //             this.propulsion1ModelLeft.scale.z -= 0.005;
            //             this.propulsion2ModelLeft.scale.z -= 0.005;
            //         } else {
            //             this.propulsion0ModelLeftMat.opacity = 0;
            //             this.propulsion1ModelLeftMat.opacity = 0;
            //             this.propulsion2ModelLeftMat.opacity = 0;
            //             this.propulsion1ModelLeft.scale.z =
            //                 this.propulsion2ModelLeft.scale.z = 0.001;
            //         }
            //
            //         if (this.propulsion0ModelRightMat.opacity > 0) {
            //             this.propulsion0ModelRightMat.opacity -= 0.02;
            //             this.propulsion1ModelRightMat.opacity -= 0.03;
            //             this.propulsion2ModelRightMat.opacity -= 0.03;
            //             this.propulsion1ModelRight.scale.z -= 0.005;
            //             this.propulsion2ModelRight.scale.z -= 0.005;
            //         } else {
            //             this.propulsion0ModelRightMat.opacity = 0;
            //             this.propulsion1ModelRightMat.opacity = 0;
            //             this.propulsion2ModelRightMat.opacity = 0;
            //             this.propulsion1ModelRight.scale.z =
            //                 this.propulsion2ModelRight.scale.z = 0.001;
            //         }
            //         this.body.velocity[0] *= this.drag;
            //         this.body.velocity[1] *= this.drag;
            //
            //     }
            // }

            if (this.inContact === true) {
                this.collide();
            } else {
                if (this.sounds.energyShield.isPlaying === true) {
                    if (this.sounds.energyShield.gain.gain.value > 0.01) {
                        this.sounds.energyShield.gain.gain.value -= 0.05;
                    } else {
                        this.sounds.energyShield.stop();
                    }
                }
            }

        } else {//if (this.dead === true) {

            this.body.velocity[0] *= this.drag;
            this.body.velocity[1] *= this.drag;
            if (this.sounds.energyShield.isPlaying === true) {
                this.sounds.energyShield.stop();
            }
            if (this.sounds.engine.isPlaying === true) {
                this.sounds.engine.stop();
            }
            this.state.particleSystems.followShipWithEmitter(this);
        }
    }

    if (this.state.console) {
        this.state.console.update(this);
    }

    this.updateShield();
    this.updatePhysics();
    this.updateContrail();

};


export default Ship;