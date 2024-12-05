import {Color,AmbientLight} from 'three';
import {vec2} from 'p2';

export default class Lights {

    public defaultColor = new Color(.25, .25, .25)

    constructor() {
        
    }

    public update() {

        // var cp = [this.engine.scene.camera.position.x, this.engine.scene.camera.position.y];
        //
        // var j = 47000;
        //
        // this.lights[0][0] = (Math.round(cp[0] / j) * j) - 5000;
        // this.lights[0][1] = (Math.round(cp[1] / j) * j) - 500;
        //
        // var r = this.defaultColor.r;
        // var g = this.defaultColor.g;
        // var b = this.defaultColor.b;
        // for (var i = 0, light, sdistance, ra, l = this.lights.length; i < l; i++) {
        //     light = this.lights[i];
        //     sdistance = vec2.squaredDistance(light, cp);
        //     if (sdistance < light[2]) {
        //         ra = 1 - (sdistance / light[2]);
        //         r += light[3] * ra;
        //         g += light[4] * ra;
        //         b += light[5] * ra;
        //     }
        // }
        // if (r > 2) r = 2;
        // if (g > 2) g = 2;
        // if (b > 2) b = 2;
        //
        // this.ambient.color.r = r;
        // this.ambient.color.g = g;
        // this.ambient.color.b = b;
    
    }
}
