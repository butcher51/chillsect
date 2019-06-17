import {AdditiveBlending, Audio, DoubleSide, Mesh, MeshBasicMaterial, PlaneBufferGeometry, RepeatWrapping} from "three";
import ParticleSystems from "../../particleSystems";
import CONFIG from "../../../../config";
import Util from "../../../../util";

var FusionGun = function (state,weaponIndex) {

    this.weaponIndex = weaponIndex;
    this.engine = state.engine;
    this.state = state;
    this.ship = state.ship;

    this.initWeapon();
    this.initBeam();
    this.initSounds();

    this.controlFlags = this.engine.controls.getControlFlags();

    this.targetObject = {
        hitParticleSysType: ParticleSystems.types.redLaserBullet,
        strength: this.strength,
        hit: false,
        body: {position: [0, 0]}
    };

};

FusionGun.prototype.constructor = FusionGun;

FusionGun.prototype.beamMesh = null;
FusionGun.prototype.active = false;

FusionGun.prototype.blockTime = 0.1;
FusionGun.prototype.strength = 30;//                1/0.1 * 15     =       150 hp/sec
FusionGun.prototype.lastShootTime = 0;

FusionGun.prototype.amount = 99;

FusionGun.prototype.initSounds = function () {

    this.sound = new Audio(this.engine.audioListener);
    this.sound.setBuffer(this.engine.loader.resources['fusionGun'].buffer);
    this.sound.setLoop(true);
    this.sound.gain.gain.value = 0;

};

FusionGun.prototype.initWeapon = function () {

    const material = new MeshBasicMaterial({
        map: this.engine.loader.resources['ship01texture'].texture
    });

    this.weaponMesh = new Mesh(this.engine.loader.resources['fusionGunModel'].geometry, material);
    this.weaponMesh.position.z = -0.1;

};

FusionGun.prototype.initBeam = function () {

    {
        var texture = this.engine.loader.resources.weaponsTexture.texture.clone();
        texture.needsUpdate = true;
        texture.offset.x = 0.25;
        texture.offset.y = 0.25;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(0.25, 0.25);

        this.beamMesh = new Mesh(
            new PlaneBufferGeometry(1, 1),
            new MeshBasicMaterial({
                map: texture,
                transparent: true,
                blending: AdditiveBlending
            })
        );
    }
    this.beamMesh.renderOrder = 10;

    this.beamMesh.position.y = 0.37;
    this.beamMesh.rotation.x = -Math.PI / 2;

    var texture = this.engine.loader.resources.weaponsTexture.texture.clone();
    texture.needsUpdate = true;
    texture.offset.x = 0.25;
    texture.offset.y = 0.25;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(0.25, 0.25);

    this.beamStart = new Mesh(
        new PlaneBufferGeometry(2.2, 2.2),
        new MeshBasicMaterial({
            map: texture,//fusionBeamStartTexture
            transparent: true,
            blending: AdditiveBlending,
            side: DoubleSide
        })
    );

    this.beamStart.renderOrder = 5;
    this.beamStart.position.z = 0.75;
    this.beamStart.position.y = 0.369;
    this.beamStart.rotation.x = -Math.PI / 2;
    {
        var texture = this.engine.loader.resources.weaponsTexture.texture.clone();
        texture.needsUpdate = true;
        texture.offset.x = 0.0;
        texture.offset.y = 0.0;
        texture.repeat.set(0.25, 0.25);

        this.beamEnd = new Mesh(
            new PlaneBufferGeometry(3,3),
            new MeshBasicMaterial({
                map: texture,
                transparent: true,
                blending: AdditiveBlending,
                side: DoubleSide
            })
        );
    }

    this.beamEnd.renderOrder = 8;
    this.beamEnd.position.z = 20.98;
    this.beamEnd.position.y = 0.36;
    this.beamEnd.rotation.x = -Math.PI / 2;

    this.beamMesh.scale.set(14, 14, 14);


};

FusionGun.prototype.detachWeapon = function () {
    this.ship.warpperObj.children[0].remove(this.beamMesh);
    this.ship.warpperObj.children[0].remove(this.weaponMesh);
    this.ship.warpperObj.children[0].remove(this.beamStart);
    this.ship.warpperObj.children[0].remove(this.beamEnd);
};

FusionGun.prototype.attachWeapon = function () {
    this.ship.warpperObj.children[0].add(this.beamMesh);
    this.ship.warpperObj.children[0].add(this.weaponMesh);
    this.ship.warpperObj.children[0].add(this.beamStart);
    this.ship.warpperObj.children[0].add(this.beamEnd);
};

FusionGun.prototype.tmpCircleLineIntersectionParams = {
    c: {center: {x: 0, y: 0}, radius: 0},
    l: {
        p1: {x: 0, y: 0},
        p2: {x: 0, y: 0}
    }
};

FusionGun.prototype.shoot = function () {

    if (!(this.ship.energy > CONFIG.ENERGY_MANAGEMENT.MIN_VALUE)) {
        return;
    }

    if (this.amount < 1) {
        return;
    }

    if (this.lastShootTime < this.engine.time) {

        var vb = this.engine.states.get().world.children;

        this.tmpCircleLineIntersectionParams.l.p1.x = this.ship.body.position[0];
        this.tmpCircleLineIntersectionParams.l.p1.y = this.ship.body.position[1];
        this.tmpCircleLineIntersectionParams.l.p2.x = this.ship.body.position[0] + (this.controlFlags.mouse.x );
        this.tmpCircleLineIntersectionParams.l.p2.y = this.ship.body.position[1] + (this.controlFlags.mouse.y );

        this.targetObject.hit = false;
        for (var k = 0, o, il = vb.length; k < il; k++) {
            o = vb[k];
            if (o.visible === true) {

                this.tmpCircleLineIntersectionParams.c.center.x = o.position.x;
                this.tmpCircleLineIntersectionParams.c.center.y = o.position.y;
                this.tmpCircleLineIntersectionParams.c.radius = o.size;// ez még nem biztos hogy jó

                var result = Util.circleLineIntersections(this.tmpCircleLineIntersectionParams.c, this.tmpCircleLineIntersectionParams.l);
                if (result.length > 0) {
                    this.targetObject.body.position[0] = result[0].x;
                    this.targetObject.body.position[1] = result[0].y;
                    if (o.hit) {
                        this.targetObject.hit = true;
                        o.hit(this.targetObject);
                        break;
                    }
                }

            }
        }

        if (this.sound.isPlaying === false) {
            this.sound.play();
        }
        if (this.sound.gain.gain.value < 1) {
            this.sound.gain.gain.value += 0.2;
        }

        if (this.state.console) {
            this.state.console.updateWeaponAmount(this.weaponIndex,--this.amount);
        }

        this.lastShootTime = this.engine.time + this.blockTime;
    }

    this.active = true;

};

FusionGun.prototype.playSound = function () {

    if (!this.engine.sound) {
        return;
    }

    for (var i = 0, l = this.sound.length; i < l; i++) {
        if (this.sound[i].isPlaying === true) {
            continue;
        }
        this.sound[i].play();
        return;
    }
};

FusionGun.prototype.update = function () {

    this.beamMesh.visible = false;
    this.beamStart.visible = false;
    this.beamEnd.visible = false;
    // this.beamEnd2.visible = false;

    if (this.active === true) {

        var vk = [];
        if (this.targetObject.hit) {
            vk[0] = this.targetObject.body.position[0];
            vk[1] = this.targetObject.body.position[1];
        } else {
            vk[0] = this.ship.body.position[0] + this.controlFlags.mouse.x;
            vk[1] = this.ship.body.position[1] + this.controlFlags.mouse.y;
        }

        var d = Util.dist(vk, this.ship.body.position);
        var l = this.beamMesh.scale.y + (d / this.ship.size - this.beamMesh.scale.y) - (45 / this.ship.size);

        this.beamMesh.scale.set(1, l, 1);
        this.beamMesh.position.z = (l * 0.5) + (30 / this.ship.size);

        this.beamEnd.position.z = (l) + (30 / this.ship.size);

        this.beamMesh.visible = true;
        this.beamStart.visible = true;
        this.beamEnd.visible = true;
        this.beamMesh.material.map.offset.y += 0.08;

        var r = 0.5 + Util.Random.get();
        this.beamStart.material.opacity = r;
        this.beamMesh.material.opacity = r;
        this.beamEnd.material.opacity = r;

    } else {
        this.beamMesh.scale.set(2, 0, 1);

        if (this.sound.isPlaying == true) {
            if (this.sound.gain.gain.value > 0) {
                this.sound.gain.gain.value -= 0.1;
            } else {
                this.sound.gain.gain.value = 0;
                this.sound.stop();
            }
        }

    }

    this.active = false;

};

export default FusionGun;