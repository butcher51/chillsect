import {MeshLambertMaterial, AudioListener, Object3D, AnimationMixer, Raycaster, Plane, Vector3, RepeatWrapping, Mesh, AdditiveBlending, PointLight, SpotLight, MeshBasicMaterial, PlaneBufferGeometry} from 'three';
import {World} from 'p2';
import TWEEN from 'tween.js';
import Scene from './Scene';
import StateManager from './StateManager';
import Loader from './Loader';
import Controls from './Controls';
import Stats from './stats.min.js';

var Engine = function () {

    this.scene = new Scene();

    this.states = new StateManager(this);
    this.loader = new Loader(this);
    this.controls = new Controls(this);

    this.mixer = new AnimationMixer(this.scene);

    this.audioListener = new AudioListener();
    this.scene.camera.add(this.audioListener);

    this.world = new World();
    this.world.applyGravity = false;
    this.world.applySpringForces = false;
    this.world.applyDamping = false;
    this.world.solver.iterations = 1;

    this.root = new Object3D();
    this.scene.scene.add(this.root);

    this.sound = true;

    var that = this;
    window.addEventListener("resize", function () {
        that.scene.resize();
        that.states.resize();
    });

    this.paused = false;

    this.i = 0;

};

Engine.prototype = {
    fixedTimeStep: 1 / 60,
    delta: undefined,
    time: undefined,
    lastTime: undefined,
    initStats: function () {

        this.stats = new Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.domElement);

        this.stats.domElement.style.left = '';
        this.stats.domElement.style.right = '0px';
        this.stats.domElement.style.top = '';
        this.stats.domElement.style.bottom = '0px';

    },
    reset: function () {

        delete this.world;
        this.world = new World();
        this.world.applyGravity = false;
        this.world.applySpringForces = false;
        this.world.applyDamping = false;
        this.world.solver.iterations = 1;

        while (this.scene.scene.children.length > 0) {
            this.scene.scene.remove(this.scene.scene.children[0]);
        }

        this.root = new Object3D();
        this.scene.scene.add(this.root);

    },
    add: function (gameObject) {
        this.root.add(gameObject);
    },
    remove: function (gameObject) {
        this.root.remove(gameObject);
    },
    pause: function () {
        this.paused = true;
    },
    resume: function () {
        this.paused = false;
    },
    update: function (time) {

        if (this.paused === true) {
            return;
        }

        if (this.stats) this.stats.begin();

        this.time = time / 1000;
        this.delta = 0;
        if (this.time !== undefined && this.lastTime !== undefined) {
            this.delta = this.time - this.lastTime;
        }

        // physics
        this.world.step(this.fixedTimeStep/*, this.delta, 1*/);

        // game logic
        this.states.update();
        TWEEN.update(this.time);

        // render
        this.scene.render();
        this.mixer.update(this.delta);

        this.lastTime = this.time;

        if (this.stats) this.stats.end();
    }
};

export default Engine;