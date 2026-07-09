import {MeshLambertMaterial,Object3D,Raycaster,Plane,Vector3,RepeatWrapping,Mesh,AdditiveBlending,PointLight,SpotLight,MeshBasicMaterial,PlaneBufferGeometry} from 'three';
import {Body,Convex,Circle} from 'p2';

class GameObject extends Object3D {

    constructor() {
        super();

        this.engine = window.game.engine;
        this.state = this.engine.states.get();
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
        this.engine.world.removeBody(this.body);
    }

    create() {

    }

    update() {

    }

    playSound(key) {

        if (!this.engine.sound) {
            return;
        }

        var s = this.sounds[key];
        for (var i = 0, l = s.length; i < l; i++) {
            if (s[i].isPlaying === true) {
                continue;
            }
            s[i].play();
            return;
        }
    }

    initPhysics(options) {

        options.radius = options.radius || 1;

        var type = options.type || Body.DYNAMIC;

        var shape = new Circle(options);

        if (options.collisionGroup) {
            shape.collisionGroup = options.collisionGroup;
        }
        if (options.collisionMask) {
            shape.collisionMask = options.collisionMask;
        }

        this.body = new Body({
            mass: options.mass,
            type: type,
            position: [0, 0]
        });

        this.body.addShape(shape);

        this.body.gameObject = this;
    }

    enablePhysics() {
        this.engine.world.addBody(this.body);
    }

    disablePhysics() {
        this.engine.world.removeBody(this.body);
    }

    updatePhysics() {

        this.position.x = this.body.position[0];
        this.position.y = this.body.position[1];
        this.rotation.z = this.body.angle;

    }
}

export default GameObject;
