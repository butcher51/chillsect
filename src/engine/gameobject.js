import {MeshLambertMaterial,Object3D,Raycaster,Plane,Vector3,RepeatWrapping,Mesh,AdditiveBlending,PointLight,SpotLight,MeshBasicMaterial,PlaneBufferGeometry} from 'three';
import {Body,Convex,Circle} from 'p2';

var GameObject = function () {

    Object3D.call(this);

    this.engine = window.game.engine;
    this.state = this.engine.states.get();

};

GameObject.prototype = Object.create(Object3D.prototype);
GameObject.prototype.constructor = GameObject;

//GameObject.prototype.otype = 1;

//GameObject.prototype.removeAll = function () {
//    for (var i = this.children.length - 1; i >= 0; i--) {
//        this.children[i].disable();
//        this.remove(this.children[i]);
//    }
//};

GameObject.prototype.enable = function () {
    if (this.visible === true) {
        return;
    }
    this.visible = true;
    this.engine.world.addBody(this.body);
};

GameObject.prototype.disable = function () {
    this.visible = false;
    this.engine.world.removeBody(this.body);
};

GameObject.prototype.create = function () {


};

GameObject.prototype.update = function () {


};

GameObject.prototype.playSound = function (key) {

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
};

GameObject.prototype.initPhysics = function (options) {

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
};

GameObject.prototype.enablePhysics = function () {
    this.engine.world.addBody(this.body);
};

GameObject.prototype.disablePhysics = function () {
    this.engine.world.removeBody(this.body);
};

GameObject.prototype.updatePhysics = function () {

    this.position.x = this.body.position[0];
    this.position.y = this.body.position[1];
    this.rotation.z = this.body.angle;

};

export default  GameObject;