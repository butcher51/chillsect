import { RepeatWrapping, AdditiveBlending, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, PointLight } from 'three';
import Projectile from './projectile';
import ProjectileRenderer from './projectileRenderer';
import ParticleSystems from '../../particleSystems';
import CONFIG from '../../../../config';
import Util from '../../../../util';
import { Game } from '../../../..';
import { IState } from '../../../../types';


export default class LaserWeapon extends Object3D {

    public state: any;
    public ship: any;

    public type = 'laser';

    public projectileIndex = 0;
    public projectileForce = 2000;

    public blockTime = 0.15;// TODO UJRA SZÁMOLNI
    public strength = 15;//                1/0.4 * 20      =   50 hp/sec

    public projectileLife = 40;

    public side = -1;
    public muzzleFlashBlockTime = 0.05;

    public amount = 99;
    weaponMesh: any;
    projectileBufferSize: number;
    projectileBuffer: any[];
    projectileRender: any;
    lastShootTime: number;

    constructor(state: IState, private weaponIndex) {
        super();

        this.weaponIndex = weaponIndex;
        this.state = state;
        this.ship = this.state.ship;

        this.initWeapon();
        this.initProjectiles();
        this.initMuzzleFlash();

    }

    public initWeapon() {

        var material = new MeshBasicMaterial({
            color: 0xffffff,
            map: Game.engine.loader.resources['ship01texture'].texture
        });

        this.weaponMesh = new Mesh(Game.engine.loader.resources['basicWeaponModel'].geometry, material);
        this.weaponMesh.position.x = 0;
        this.weaponMesh.position.y = 0;
        this.weaponMesh.position.z = 0;

    };

    public detachWeapon() {
        this.ship.wrapperObj.children[0].remove(this.weaponMesh);
    };

    public attachWeapon() {
        this.ship.wrapperObj.children[0].add(this.weaponMesh);
    };

    public initProjectiles() {

        this.projectileBufferSize = 10;
        this.projectileBuffer = [];

        for (var i = 0; i < this.projectileBufferSize; i++) {
            this.projectileBuffer.push(
                new Projectile(Game.engine, ParticleSystems.types.redLaserBullet, this.projectileLife, this.strength)
            );
        }

        this.projectileRender = new ProjectileRenderer({
            projectileBufferSize: this.projectileBufferSize,
            projectileBuffer: this.projectileBuffer,
            texture: Game.engine.loader.resources.weaponsTexture.texture,
            textureCrop: { x: 0.25, y: 0.75 }
        });
        this.projectileRender.position.z = 14;

        Game.engine.scene.scene.add(this.projectileRender);


    }

    public muzzleFlash = null;

    public initMuzzleFlash() {

        var texture = Game.engine.loader.resources.weaponsTexture.texture.clone();
        texture.needsUpdate = true;
        texture.offset.x = 0.25;
        texture.offset.y = 0.5;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(0.25, 0.25);

        var material = new MeshBasicMaterial({
            map: texture,
            transparent: true,
            blending: AdditiveBlending
        });

        var size = this.ship.size;

        var geometry = new PlaneGeometry(60 / size, 80 / size, 1, 1);

        var muzzleFlash = new Mesh(geometry, material);
        //muzzleFlash.rotation.z = -90 * (Math.PI / 180);
        muzzleFlash.rotation.x = -90 * (Math.PI / 180);
        muzzleFlash.position.set(16 / size, 14 / size, 25 / size);//oldalra fel előre
        muzzleFlash.visible = false;
        muzzleFlash.renderOrder = 2;

        this.ship.wrapperObj.children[0].add(muzzleFlash);

        this.muzzleFlash = muzzleFlash;

    }

    public shootCommon() {

        if (!(this.ship.energy > CONFIG.ENERGY_MANAGEMENT.MIN_VALUE)) {
            return;
        }

        if (this.lastShootTime + this.blockTime > Game.engine.time) {
            return;
        }
        this.lastShootTime = Game.engine.time;

        this.releaseMuzzleFlash();

        var angle = Util.normalizeAngle(this.ship.body.angle);

        this.releaseProjectiles(Util.vectorFromAngle(angle), angle);

        if (this.state.console) {
            this.state.console.updateWeaponAmount(this.weaponIndex, --this.amount);
        }

        this.playShootSound();
    }
    playShootSound() {
        this.state.sounds.play("basicWeapon");
    }
    releaseProjectiles(direction: any, angle: any) {
        this.releaseProjectile(direction, angle);
    }
    releaseMuzzleFlash() {
        this.muzzleFlash.visible = true;
    }

    public shoot() {
        this.shootCommon();
    };

    public releaseProjectile = function (direction, angle) {

        var projectile = this.projectileBuffer[this.projectileIndex++];

        if (this.projectileIndex >= this.projectileBufferSize) {
            this.projectileIndex = 0;
        }

        projectile.onShoot();

        this.setShotPosition(projectile, angle);

        projectile.body.velocity[0] = this.ship.body.velocity[0] + direction[0] * this.projectileForce;
        projectile.body.velocity[1] = this.ship.body.velocity[1] + direction[1] * this.projectileForce;

        projectile.body.angle = this.ship.body.angle + Math.PI / 2;

        projectile.visible = true;

    }

    public setShotPosition = function (projectile, angle) {

        projectile.body.position[0] = this.ship.position.x + ((Math.cos(angle + 0.2 * this.side) * 75));
        projectile.body.position[1] = this.ship.position.y + ((Math.sin(angle + 0.2 * this.side) * 75));

        this.muzzleFlash.position.x *= -1;

        this.side *= -1;

    }

    public update = function () {

        if (this.muzzleFlash) {
            if (this.muzzleFlash.visible === true && this.lastShootTime + this.muzzleFlashBlockTime < Game.engine.time) {
                this.muzzleFlash.visible = false;
            }
        }

        this.projectileRender.update();
    }
}


