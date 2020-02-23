import GameObject from "../../engine/gameobject";
import Asteroid from "./gameObjects/Asteroid";
import Enemy00 from "./gameObjects/enemies/Enemy00";
import Enemy01 from "./gameObjects/enemies/Enemy01";
import Enemy02 from "./gameObjects/enemies/Enemy02";
import KyberCrystal from "./gameObjects/kyberCrystal";

var World = function() {
	GameObject.call(this);

	var objects = {
		Asteroid: Asteroid,
		Enemy00: Enemy00,
		Enemy01: Enemy01,
		Enemy02: Enemy02,
		KyberCrystal: KyberCrystal
	};

	var bufferData = this.engine.loader.resources.level.data["buffers"];

	this.buffer = [];
	var o, className, count;
	for (var i = 0, il = bufferData.length; i < il; i++) {
		var buffer = [];
		className = bufferData[i].class;
		count = bufferData[i].count;
		for (var g = 0, gl = count; g < gl; g++) {
			o = new objects[className]();
			this.add(o);
			buffer[g] = o;
		}
		this.buffer.push(buffer);
	}

	this.shift = 16;
	this.frameStep = 0;
	this.frameFrekvency = 50;
	this.distancLimitSquared = 2000 * 2000;

	buffer = this.engine.loader.resources["mapByteBuffer"].byteArray;
	this.intMap = new Int32Array(buffer);
	this.floatMap = new Float32Array(buffer);

	this.slength = this.intMap.length / this.shift / this.frameFrekvency;

	console.log("Object count", buffer.byteLength / this.shift / 4);
};

World.prototype = Object.create(GameObject.prototype);
World.prototype.constructor = World;

World.prototype.update = function() {
	var sx = this.state.ship.position.x;
	var sy = this.state.ship.position.y;

	var intMap = this.intMap;

	var onScreen = [];

	if (this.frameStep === this.frameFrekvency) {
		this.frameStep = 0;
	}

	var w, wl, o, x, y, buffer;
	var k = 0,
		j = parseInt(this.frameStep * this.slength);
	var jl = parseInt(j + this.slength) + 1;
	for (; j < jl; j++) {
		i = j * this.shift;
		x = intMap[i] - sx;
		y = intMap[i + 1] - sy;
		l = x * x + y * y;
		if (l < this.distancLimitSquared) {
			if (intMap[i + 2] === 0) {
				onScreen[k++] = i;
			}
		}
	}

	for (j = 0, jl = onScreen.length; j < jl; j++) {
		i = onScreen[j];
		intMap[i + 2] = 1;
		buffer = this.buffer[intMap[i + 3]];
		o = null;
		for (w = 0, wl = buffer.length; w < wl; w++) {
			if (buffer[w].visible === false) {
				o = buffer[w];
				break;
			}
		}
		if (o === null) {
			console.log("No free buffer item", intMap[i + 3]);
		} else {
			o.position.x = o.body.position[0] = this.intMap[i];
			o.position.y = o.body.position[1] = this.intMap[i + 1];
			o.body.velocity[0] = 0;
			o.body.velocity[1] = 0;
			o.setAleas([
				this.intMap[i], //x
				this.intMap[i + 1], //y
				this.intMap[i + 2], //visibleFlag
				this.intMap[i + 3], //type
				this.intMap[i + 4], // hp
				this.intMap[i + 5], // size
				this.floatMap[i + 6],
				this.floatMap[i + 7],
				this.floatMap[i + 8],
				this.floatMap[i + 9],
				this.floatMap[i + 10],
				this.floatMap[i + 11],
				this.floatMap[i + 12],
				this.floatMap[i + 13],
				this.floatMap[i + 14],
				this.floatMap[i + 15]
			]);
			o.mapIndex = i;
		}
	}

	this.frameStep++;

	for (j = 0, jl = this.buffer.length; j < jl; j++) {
		buffer = this.buffer[j];
		for (w = 0, wl = buffer.length; w < wl; w++) {
			o = buffer[w];
			if (o.mapIndex === -1) {
				continue;
			}

			intMap[o.mapIndex + 0] = o.body.position[0];
			intMap[o.mapIndex + 1] = o.body.position[1];
			intMap[o.mapIndex + 4] = o.hp;

			x = o.body.position[0] - sx;
			y = o.body.position[1] - sy;
			l = x * x + y * y;
			if (l > this.distancLimitSquared) {
				o.disable();
				intMap[o.mapIndex + 2] = 0;
				o.mapIndex = -1;
			}
		}
	}

	var c = this.children;
	for (var i = 0, l = c.length; i < l; i++) {
		c[i].update();
	}
};

export default World;
