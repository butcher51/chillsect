import {MeshBasicMaterial, RepeatWrapping} from "three";
import {Body, Circle} from "p2";
import SpaceObject from "./spaceObject";

var Asteroid = function () {

    this.engine = window.game.engine;
    this.state = this.engine.states.get();

    if (Asteroid.materialBuffer.length === 0) {


        var texture = this.engine.loader.resources['asteroidTexture'].texture.clone();
        texture.needsUpdate = true;
        texture.offset.x = 0;
        texture.offset.y = 0;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(0.25, 0.25);

        Asteroid.materialBuffer[0] = new MeshBasicMaterial({
            color: 0xffffff,
            map: texture
        });

        texture = this.engine.loader.resources['asteroidTexture'].texture.clone();
        texture.needsUpdate = true;
        texture.offset.x = 0.25;
        texture.offset.y = 0.25;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(0.25, 0.25);

        Asteroid.materialBuffer[1] = new MeshBasicMaterial({
            color: 0xffffff,
            map: texture
        });

        texture = this.engine.loader.resources['asteroidTexture'].texture.clone();
        texture.needsUpdate = true;
        texture.offset.x = 0;
        texture.offset.y = 0.25;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(0.25, 0.25);


        Asteroid.materialBuffer[2] = new MeshBasicMaterial({
            color: 0xffffff,
            map: texture
        });

        texture = this.engine.loader.resources['asteroidTexture'].texture.clone();
        texture.needsUpdate = true;
        texture.offset.x = 0.25;
        texture.offset.y = 0;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(0.25, 0.25);

        Asteroid.materialBuffer[3] = new MeshBasicMaterial({
            color: 0xffffff,
            map: texture
        });


    }

    SpaceObject.call(this, this.engine.loader.resources['asteroid01Model'].geometry, Asteroid.materialBuffer);

};

Asteroid.prototype = Object.create(SpaceObject.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.materialBuffer = [];

export default Asteroid;