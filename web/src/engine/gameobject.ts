import { MeshLambertMaterial, Object3D, Position, Rotation, Raycaster, Plane, Vector3, RepeatWrapping, Mesh, AdditiveBlending, PointLight, SpotLight, MeshBasicMaterial, PlaneBufferGeometry } from 'three';
import { Body, Convex, Circle } from 'p2';
import { Game } from '..';

export default class GameObject extends Object3D {

    public state: any;
    public visible: boolean;
    public body: any;
    public sounds: any = {};
    public position: Position;
    public rotation: Rotation;
    public scale: Vector3;

    constructor() {
        super();
        this.state = Game.engine.states.get();
    }

    get children(): Object3D[] {
        return super.children;
    }

    set children(x: any[]) {
        super.children = x;
    }

    public remove(o) {
        super.remove(o);
    }

    public enable(): void {
        if (this.visible === true) {
            return;
        }
        this.visible = true;
        Game.engine.world.addBody(this.body);
    };

    public disable(): void {
        this.visible = false;
        Game.engine.world.removeBody(this.body);
    };

    public create(): void {

    };

    public update(delta: number): void {

    };

    public playSound(key): void {

        if (!Game.engine.sound) {
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

    public initPhysics(options) {

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

    public enablePhysics(): void {
        Game.engine.world.addBody(this.body);
    }

    public disablePhysics(): void {
        Game.engine.world.removeBody(this.body);
    }

    public updatePhysics(): void {

        this.position.x = this.body.position[0];
        this.position.y = this.body.position[1];
        this.rotation.z = this.body.angle;

    }

    public add(gameObject: GameObject): any {
        return super.add(gameObject);
    }
}