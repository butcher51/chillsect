import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector3 } from "three";


function create(weapon) {

  weapon.size = weapon.size || 32;

  var pointCount = weapon.projectileBufferSize;
  var positionsBuffer = new Float32Array(pointCount * 3);

  for (var i = 0; i < pointCount; i++) {
    var pos = new Vector3(i * 10, 0, 0);
    pos.toArray(positionsBuffer, i * 3);
  }

  var geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positionsBuffer, 3));

  var vertexshader = [
    "uniform float elapsedTime;",
    "void main() {",

    "vec4 mvPosition = modelViewMatrix * vec4( position.x, position.y, position.z , 1.0 );",

    "gl_PointSize = " + weapon.size + ".0;",
    "gl_Position = projectionMatrix * mvPosition;",

    "}",

    ""
  ].join("\n");

  var fragmentshader = [
    "uniform sampler2D texture;",
    "uniform vec2 textureCrop;",
    "void main() {",

    "vec2 vUv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );",

    "vUv.x = textureCrop.x - (gl_PointCoord.x * 0.25);",
    "vUv.y = textureCrop.y - (gl_PointCoord.y * 0.25);",

    "vec4 textureColor = texture2D( texture, vUv);",

    "gl_FragColor = textureColor;",
    "}"
  ].join("\n");

  var material = new ShaderMaterial({
    uniforms: {
      texture: { type: "t", value: weapon.texture },
      elapsedTime: { type: "f", value: 0 },
      textureCrop: { type: "v2", value: weapon.textureCrop }
    },
    vertexShader: vertexshader,
    fragmentShader: fragmentshader,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: AdditiveBlending
  });

  return { geometry, material };
}

export default class ProjectileRenderer extends Points {
  geometry: any;

  constructor(private weapon) {
    const { geometry, material } = create(weapon);
    super(geometry, material);

    super.frustumCulled = false;
  }

  public update(): void {
    var w = this.weapon;

    for (var i = 0, index = 0, p; i < w.projectileBufferSize; i++) {
      p = w.projectileBuffer[i];
      if (p.visible) {
        p.update();
        index = i * 3;
        this.geometry.attributes.position.array[index] = p.body.position[0];
        this.geometry.attributes.position.array[index + 1] = p.body.position[1];
        this.geometry.attributes.position.array[index + 2] = 0;
      } else {
        this.geometry.attributes.position.array[i * 3 + 2] = -3000;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
}

