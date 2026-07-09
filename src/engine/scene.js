import { Scene, OrthographicCamera, WebGL1Renderer, Vector3 } from "three";

import getCameraSize from "./getCameraSize.js";

var Scene_ = function() {
	this.scene = new Scene();

	this.cameraSize = getCameraSize();
	this.cameraFactor = 2;
	this.camera = new OrthographicCamera(
		this.cameraSize.width / -this.cameraFactor,
		this.cameraSize.width / this.cameraFactor,
		this.cameraSize.height / this.cameraFactor,
		this.cameraSize.height / -this.cameraFactor,
		-1500,
		2500
	);

	this.camera.position.z = 0;
	this.camera.position.y = 0;
	this.camera.position.x = 0;
	this.camera.up = new Vector3(0, 0, 1);
	this.camera.rotateOnAxis(new Vector3(0, 0, 1), 45 * (Math.PI / 180));
	this.camera.rotateOnAxis(new Vector3(1, 0, 0), 50 * (Math.PI / 180));
	this.scene.add(this.camera);

	this.renderer = new WebGL1Renderer({
		alpha: false,
		antialias: false,
		stencil: false,
		premultipliedAlpha: false
	});

	this.renderer.shadowMap.enabled = false;

	// updateStyle=false: keep the high-res (devicePixelRatio-scaled) drawing
	// buffer, but do NOT let three write the buffer size onto the canvas'
	// inline CSS width/height. CSS makes the canvas fill the viewport exactly
	// (see index.html), which also keeps it aligned with the mouse math in
	// controls.js that maps against window.innerWidth/innerHeight.
	this.renderer.setSize(this.cameraSize.width, this.cameraSize.height, false);

	document.body.appendChild(this.renderer.domElement);

	this.resize = function() {
		"use strict";
		this.cameraSize = getCameraSize();

		this.cameraFactor = 2; //this.cameraSize.height / this.factorDiv;
		this.renderer.setSize(this.cameraSize.width, this.cameraSize.height, false);
		this.camera.left = -this.cameraSize.width / this.cameraFactor;
		this.camera.right = this.cameraSize.width / this.cameraFactor;
		this.camera.top = this.cameraSize.height / this.cameraFactor;
		this.camera.bottom = -this.cameraSize.height / this.cameraFactor;
		this.camera.aspect = this.cameraSize.width / this.cameraSize.height;
		this.camera.updateProjectionMatrix();
	};

	this.render = function() {
		this.renderer.render(this.scene, this.camera);
	};
};

export default Scene_;
