import { Plane, Raycaster, Vector3 } from "three";

import getCameraSize from "./getCameraSize";

var Controls = function(engine) {
	this.engine = engine;

	var controlFlags = {
		mouse: new Vector3(0, 0, 0),
		mouseMove: false,
		mouseButton1: false,
		mouseButton3: false,
		ctrl: false,
		space: false,
		shoot: false,
		mouseDownTime: 0,
		mouseUpTime: 0,
		keyUp: false,
		keyDown: false,
		keyLeft: false,
		keyRight: false,
		wheel: false
	};

	var raycaster = new Raycaster();

	var planeZ = new Plane(new Vector3(0, 0, 1), 0);

	var projectMouseCoords = function(event) {
		controlFlags.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		controlFlags.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		// raycaster.setFromCamera(controlFlags.mouse, engine.scene.camera);
		raycaster.ray.origin.set(controlFlags.mouse.x, controlFlags.mouse.y, -1).unproject(engine.scene.camera);
		raycaster.ray.direction.set(0, 0, -1).transformDirection(engine.scene.camera.matrixWorld);

		var main = engine.states.get("main");
		if (!main) {
			return;
		}

		var ship = main.ship;
		if (!ship) {
			return;
		}

		controlFlags.mouse = raycaster.ray.intersectPlane(planeZ, controlFlags.mouse).sub(ship.position);
	};

	var canvas = document.querySelector("canvas");
	canvas.addEventListener("mousedown", onDocumentMouseDown, false);
	document.addEventListener("mousemove", onDocumentMouseMove, false);
	document.addEventListener("mouseup", onDocumentMouseUp, false);

	document.addEventListener("wheel", onDocumentMouseWheel, false);

	document.addEventListener("keydown", onDocumentKeyDown, false);
	document.addEventListener("keyup", onDocumentKeyUp, false);

	function onDocumentMouseWheel(event) {
		if (event.ctrlKey === false) {
			projectMouseCoords(event);
			controlFlags.wheel = true;
			setTimeout(() => {
				controlFlags.wheel = false;
			}, 30);
		}
		if (event.ctrlKey === true) {
			const canvas = document.querySelector("canvas");
			const cameraSize = getCameraSize();
			canvas.style.width = cameraSize.width + "px";
			canvas.width = cameraSize.width;
			setTimeout(() => {
				canvas.style.width = cameraSize.width + "px";
				canvas.width = cameraSize.width;
			}, 30);
			setTimeout(() => {
				canvas.style.width = cameraSize.width + "px";
				canvas.width = cameraSize.width;
			}, 50);
			setTimeout(() => {
				canvas.style.width = cameraSize.width + "px";
				canvas.width = cameraSize.width;
			}, 70);
		}
		return false;
	}

	function onDocumentKeyDown(event) {
		// if (event.ctrlKey === true) {
		// 	controlFlags.ctrl = true;
		// }
		if (event.keyCode === 32) {
			controlFlags.space = true;
		}
		if (event.keyCode === 37 || event.keyCode === 65) {
			//  jobb, d
			controlFlags.keyLeft = true;
		}
		if (event.keyCode === 39 || event.keyCode === 68) {
			// bal, a
			controlFlags.keyRight = true;
		}
		if (event.keyCode === 38 || event.keyCode === 87) {
			// előre, w
			controlFlags.keyUp = true;
		}
		if (event.keyCode === 40 || event.keyCode === 83) {
			// hátra. s
			controlFlags.keyDown = true;
		}
		event.preventDefault();
		event.stopPropagation();
	}

	function onDocumentKeyUp(event) {
		// controlFlags.ctrl = false;
		if (!engine.states.get("main").ship || !engine.states.get("main").ship.active) {
			return;
		}
		if (event.keyCode === 80 || event.keyCode === 9 || event.keyCode === 27) {
			setTimeout(function() {
				if (engine.states.get("main").controlPanel) {
					engine.states.get("main").controlPanel.toggle();
				}
			}, 1);
		}
		if (event.keyCode === 37 || event.keyCode === 65) {
			//  jobb, d
			controlFlags.keyLeft = false;
		}
		if (event.keyCode === 39 || event.keyCode === 68) {
			// bal, a
			controlFlags.keyRight = false;
		}
		if (event.keyCode === 38 || event.keyCode === 87) {
			// előre, w
			controlFlags.keyUp = false;
		}
		if (event.keyCode === 40 || event.keyCode === 83) {
			// hátra. s
			controlFlags.keyDown = false;
		}
		if (event.keyCode === 49) {
			setTimeout(function() {
				engine.states.get("main").weapons.set(0);
			}, 1);
		}
		if (event.keyCode === 50) {
			setTimeout(function() {
				engine.states.get("main").weapons.set(1);
			}, 1);
		}
		if (event.keyCode === 51) {
			setTimeout(function() {
				engine.states.get("main").weapons.set(2);
			}, 1);
		}
		if (event.keyCode === 52) {
			setTimeout(function() {
				engine.states.get("main").weapons.set(3);
			}, 1);
		}
		if (event.keyCode === 53) {
			setTimeout(function() {
				engine.states.get("main").weapons.set(4);
			}, 1);
		}
		if (event.keyCode === 54) {
			setTimeout(function() {
				engine.states.get("main").weapons.set(5);
			}, 1);
		}
		if (event.keyCode === 32) {
			controlFlags.space = false;
		}
		event.preventDefault();
		event.stopPropagation();
	}

	function onDocumentMouseDown(event) {
		projectMouseCoords(event);
		if (event.which === 1) {
			controlFlags.mouseButton1 = true;
		} else if (event.which === 3) {
			controlFlags.mouseButton3 = true;
		}
		controlFlags.mouseDownTime = engine.time;
		controlFlags.mouseUpTime = 0;
		onDocumentMouseMove(event);
	}

	function onDocumentMouseMove(event) {
		projectMouseCoords(event);

		//if (controlFlags.ctrl == true) {
		//    controlFlags.shoot = event.ctrlKey;
		//} else {
		//    controlFlags.shoot = false;
		//}
		if (controlFlags.mouseButton3) {
			controlFlags.shoot = true;
		}
		if (controlFlags.mouseButton1) {
			controlFlags.mouseMove = true;
		}
		event.preventDefault();
		event.stopPropagation();
		return false;
	}

	function onDocumentMouseUp(event) {
		if (event.which === 3) {
			controlFlags.shoot = controlFlags.mouseButton3 = false;
		} else if (event.which === 1) {
			controlFlags.mouseMove = controlFlags.mouseButton1 = false;
		}
		controlFlags.mouseUpTime = engine.time;
		event.preventDefault();
		event.stopPropagation();
		return false;
	}

	this.getControlFlags = function() {
		return controlFlags;
	};

	function touchstart(event) {
		switch (event.touches.length) {
			case 1:
				event.clientX = event.touches[0].pageX;
				event.clientY = event.touches[0].pageY;
				projectMouseCoords(event);
				controlFlags.mouseButton1 = true;
				controlFlags.mouseDownTime = engine.time;
				break;
		}
		touchmove(event);
	}

	function touchmove(event) {
		if (controlFlags.mouseButton1) {
			event.clientX = event.touches[0].pageX;
			event.clientY = event.touches[0].pageY;
			projectMouseCoords(event);
			controlFlags.mouseMove = true;
		}
		return false;
	}

	function touchend() {
		controlFlags.mouseMove = controlFlags.mouseButton1 = false;
		controlFlags.mouseUpTime = engine.time;
	}

	document.addEventListener("touchstart", touchstart, false);
	document.addEventListener("touchmove", touchmove, false);
	document.addEventListener("touchend", touchend, false);
};

export default Controls;
