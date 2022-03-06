import { Mesh, PlaneBufferGeometry, Position, RepeatWrapping, ShaderMaterial, Vector2 } from 'three';
import { Game } from '../../..';
import { Updateable } from '../../../types';

export default class StarField extends Mesh implements Updateable {

    private state: any;
    private material: ShaderMaterial;

    get position(): Position {
        return super.position;
    }

    constructor() {

        var vertexshader = [

            'uniform vec2 resolution;',
            'varying vec2 vUvBackground;',
            'varying vec2 vUvLayer1;',
            //'varying vec2 vUvLayer2;',
            'varying vec2 vUvClouds;',
            'varying vec2 vUvStars;',

            '#define QR 0.7853981633974483',
            '#define TARGET_WIDTH 1500.0',

            'void main() {',

            'mat2 rotation = mat2( cos(QR), -sin(QR),sin(QR), cos(QR));',

            'vec2 cpos = vec2(0,0);',
            'vec2 cpol = vec2(cameraPosition.x,cameraPosition.y);',

            'float ratio = resolution.y/resolution.x;',
            'float targetRatio = resolution.x/TARGET_WIDTH;',

            'vec2 cposBg = rotation * cpos * 0.00004;',
            'vUvBackground = vec2(uv.x*targetRatio + cposBg.x - (targetRatio/2.0 + 0.5),uv.y*targetRatio*ratio + (cposBg.y * 0.6427876096865393) - (targetRatio*ratio/2.0 + 0.5));',

            'vec2 cposLayer1 = rotation * cpos * 0.00007;',
            'vUvLayer1 = vec2(uv.x*targetRatio + cposLayer1.x - (targetRatio/2.0 + 0.5),uv.y*targetRatio*ratio + (cposLayer1.y * 0.6427876096865393) - (targetRatio*ratio/2.0 + 0.5));',

            //'vec2 cposLayer2 = rotation * cpos * 0.00030;',
            //'vUvLayer2 = vec2(uv.x*targetRatio + cposLayer2.x - (targetRatio/2.0 + 0.5),uv.y*targetRatio*ratio + (cposLayer2.y * 0.6427876096865393) - (targetRatio*ratio/2.0 + 0.5));',

            'vec2 cposStars = rotation * cpos * 0.00015;',
            'vec2 cposStep = floor((cposStars / 5.0) + 0.5) * 5.0;',
            'vUvStars = vec2(uv.x*1.5*targetRatio + cposStars.x - cposStep.x - (targetRatio/1.33333 - 1.1),uv.y*1.5*targetRatio*ratio + ( ( cposStars.y - cposStep.y ) * 0.6427876096865393) - (targetRatio*ratio/1.33333 - 0.2));',

            'vec2 cposClouds = rotation * cpos * 0.00067;',
            'vUvClouds = vec2(uv.x*targetRatio + cposClouds.x,uv.y*targetRatio*ratio + (cposClouds.y * 0.6427876096865393) );',

            'gl_Position =  vec4( position.x,position.y, 1, 1.0 );',

            '}'

        ].join('\n');

        var fragmentshader = [

            'uniform sampler2D backgroundTexture;',
            'uniform sampler2D cloudsTexture;',
            'uniform sampler2D layer1Texture;',
            //'uniform sampler2D layer2Texture;',
            'uniform sampler2D starTexture;',
            'uniform vec2 resolution;',
            'uniform vec3 ambient;',

            'varying vec2 vUvBackground;',
            'varying vec2 vUvLayer1;',
            //'varying vec2 vUvLayer2;',
            'varying vec2 vUvClouds;',
            'varying vec2 vUvStars;',

            'void main() {',

            'vec2 center = vec2(resolution.x/2.0, resolution.y/2.0);',
            'vec2 p = (gl_FragCoord.xy - center) / resolution*0.6;',
            'float r = 2.0 - sqrt(dot(p, p))*6.0;',

            'vec4 backgroundTextureColor = texture2D( backgroundTexture, vUvBackground ) * r;',
            'vec4 layer1TextureColor = texture2D( layer1Texture, vUvLayer1 );',
            //'vec4 layer2TextureColor = texture2D( layer2Texture, vUvLayer2 );',
            'vec4 cloudsTextureColor = texture2D( cloudsTexture, vUvClouds );',
            'vec4 starTextureColor = texture2D( starTexture, vUvStars );',

            'vec4 mix1 = mix(backgroundTextureColor,layer1TextureColor,layer1TextureColor.a);',
            'vec4 mix2 = mix(mix1,starTextureColor,starTextureColor.a);',
            //'vec4 mix3 = mix(mix2,layer2TextureColor,layer2TextureColor.a);',
            'vec4 mix4 = mix(mix2,cloudsTextureColor,cloudsTextureColor.a);',

            'gl_FragColor = mix4 * vec4(max(ambient,1.0),1.0);',

            '}'
        ].join('\n');

        var backgroundTexture = Game.engine.loader.resources['starField0Background'].texture;
        backgroundTexture.wrapS = RepeatWrapping;
        backgroundTexture.wrapT = RepeatWrapping;
        backgroundTexture.repeat.set(1, 1);

        var layer1Texture = Game.engine.loader.resources['starField0Layer1'].texture;
        layer1Texture.wrapS = RepeatWrapping;
        layer1Texture.wrapT = RepeatWrapping;
        layer1Texture.repeat.set(1, 1);

        //var layer2Texture = this.engine.loader.resources['starField0Layer2'].texture;
        //layer2Texture.wrapS = RepeatWrapping;
        //layer2Texture.wrapT = RepeatWrapping;
        //layer2Texture.repeat.set(1, 1);

        var cloudsTexture = Game.engine.loader.resources['starField0Clouds'].texture;
        cloudsTexture.wrapS = RepeatWrapping;
        cloudsTexture.wrapT = RepeatWrapping;
        cloudsTexture.repeat.set(1, 1);


        var starTexture = Game.engine.loader.resources['star'].texture;
        const state = Game.engine.states.get();

        var material = new ShaderMaterial({
            uniforms: {
                backgroundTexture: { type: "t", value: backgroundTexture },
                layer1Texture: { type: "t", value: layer1Texture },
                //layer2Texture: {type: "t", value: layer2Texture},
                cloudsTexture: { type: "t", value: cloudsTexture },
                starTexture: { type: "t", value: starTexture },
                resolution: { value: new Vector2(Game.engine.scene.cameraSize.width, Game.engine.scene.cameraSize.height) },
                ambient: { value: state.lights.defaultColor }
            },
            vertexShader: vertexshader,
            fragmentShader: fragmentshader
        });

        var geometry = new PlaneBufferGeometry(2, 2);

        super(geometry, material);
        this.material = material;

    }

    public resize(): void {

        super.material.uniforms.resolution.value.x = Game.engine.scene.cameraSize.width;
        super.material.uniforms.resolution.value.y = Game.engine.scene.cameraSize.height;

    }

    public update(delta: number): void {

    }

}
