import { Mesh, AdditiveBlending, Vector3, PlaneBufferGeometry, Rotation, Position, DoubleSide, BufferAttribute, MeshBasicMaterial, ShaderMaterial, Vector2 } from "three";
import { vec2 } from "p2";


function createMaterial(length, width, thrust, texture): ShaderMaterial {

  var vertexshader = [
    "uniform vec2 objectPosition;",
    "uniform vec2 objectVelocity;",
    "uniform float objectRotation;",
    "uniform float objectRoll;",

    "uniform float length;",

    "attribute vec3 objectPositions;",
    "attribute vec2 objectVelocities;",
    "attribute float objectRotations;",
    "attribute float objectRolls;",

    "varying vec2 vUv;",

    "mat3 rotateZ(float rad) {",
    "   float c = cos(rad);",
    "   float s = sin(rad);",
    "   return mat3(",
    "       c, s, 0.0,",
    "       -s, c, 0.0,",
    "       0.0, 0.0, 1.0",
    "   );",
    "}",

    "mat3 rotateX(float rad) {",
    "   float c = cos(rad);",
    "   float s = sin(rad);",
    "   return mat3(",
    "      1.0, 0.0, 0.0,",
    "      0.0, c, s,",
    "      0.0, -s, c",
    "   );",
    "}",

    "void main() {",

    "vUv=uv;",

    "vec3 pointVector = vec3(objectPositions.x - objectPosition.x ,objectPositions.y - objectPosition.y, 0);",
    "pointVector = pointVector * rotateZ(objectRotation);",

    "vec3 velocityVector = vec3(objectVelocities.x - objectVelocity.x,objectVelocities.y - objectVelocity.y , 0);",
    "velocityVector = velocityVector * rotateZ(objectRotation) * " + thrust + ";",

    "vec3 vertex = vec3(0.0,objectPositions.z * " + width + ".0,0.0) * rotateZ(objectRotation-objectRotations) * rotateX(-objectRoll) ;",

    "vec4 mvPosition = modelViewMatrix * vec4( vertex.xyz + pointVector.xyz + velocityVector.xyz, 1.0 );",

    "gl_Position = projectionMatrix * mvPosition;",

    "}",

    ""
  ].join("\n");

  var fragmentshader = [
    "uniform sampler2D texture;",
    "varying vec2 vUv;",

    "void main() {",

    "gl_FragColor = texture2D( texture, vUv);",
    // 'gl_FragColor = vec4(1.0,0,0,1.0);',
    "}"
  ].join("\n");

  var material = new ShaderMaterial({
    uniforms: {
      texture: { type: "t", value: texture },
      length: { type: "f", value: length },
      objectRotation: { type: "f", value: 0 },
      objectRoll: { type: "f", value: 0 },
      objectPosition: { type: "v2", value: new Vector2(0, 0) },
      objectVelocity: { type: "v2", value: new Vector2(0, 0) }
    },
    vertexShader: vertexshader,
    fragmentShader: fragmentshader,
    transparent: true,
    depthTest: true,
    blending: AdditiveBlending,
    depthWrite: false,
    wireframe: false
  });

  return material;
}

function createGeometry(length: number, break_: number): PlaneBufferGeometry {

  var geometry = new PlaneBufferGeometry(1, 1, Number.parseInt((length / break_) + '') - 1, 1);

  geometry.setAttribute("objectPositions", new BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));
  geometry.setAttribute("objectVelocities", new BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3));
  geometry.setAttribute("objectRotations", new BufferAttribute(new Float32Array(geometry.attributes.position.count * 1), 1));
  geometry.setAttribute("objectRolls", new BufferAttribute(new Float32Array(geometry.attributes.position.count * 1), 1));

  return geometry;
}

export default class Contrail extends Mesh {

  public material: any;
  public geometry: any;
  public frustumCulled: boolean;
  public renderOrder: number;
  public position: Position;
  public rotation: Rotation;

  public break = 5;
  public length = 50;

  constructor(engine, texture, width = 1, thrust = 0.3, length = 50, break_ = 5) {

    super(createGeometry(length, break_), createMaterial(length, width, thrust, texture));

    this.positionHistory = [];
    for (var i = this.length; i > 0; i--) {
      this.positionHistory[this.length - i] = [0, 0, 0, 0, 0, 0];
    }
    this.frustumCulled = false;

    this.renderOrder = -2;

  }

  public positionHistory = [];

  public reset(objectPosition, objectRotation, objectRoll, objectVelocity): void {
    this.positionHistory = [];
    for (var i = this.length; i > 0; i--) {
      this.positionHistory[this.length - i] = [objectPosition[0], objectPosition[1], objectRotation, objectRoll, objectVelocity[0], objectVelocity[1]];
    }
    this.update(objectPosition, objectRotation, objectRoll, objectVelocity);
    // console.log(JSON.parse(JSON.stringify(this.positionHistory)));
  }

  update(objectPosition, objectRotation, objectRoll, objectVelocity): void {
    objectRoll -= Math.PI / 2;

    var u = this.material.uniforms;
    u.objectPosition.value.x = objectPosition[0];
    u.objectPosition.value.y = objectPosition[1];
    u.objectRotation.value = objectRotation;
    u.objectRoll.value = objectRoll;
    u.objectVelocity.value.x = objectVelocity[0];
    u.objectVelocity.value.y = objectVelocity[1];

    var objectPositions = this.geometry.attributes.objectPositions.array;
    var objectVelocities = this.geometry.attributes.objectVelocities.array;
    var objectRotations = this.geometry.attributes.objectRotations.array;
    var objectRolls = this.geometry.attributes.objectRolls.array;

    this.positionHistory[this.length] = [objectPosition[0], objectPosition[1], objectRotation, objectRoll, objectVelocity[0], objectVelocity[1]];
    for (var i = 1, il = this.length; i <= il; i++) {
      this.positionHistory[i - 1] = this.positionHistory[i];
    }

    for (var i = 0, index, index2, j, il = parseInt((this.length / this.break) + ''); i < il; i++) {
      j = (i + 1) * this.break;

      index = i * 3;
      index2 = (i + il) * 3;

      objectPositions[index] = this.positionHistory[j][0];
      objectPositions[index + 1] = this.positionHistory[j][1];
      objectPositions[index + 2] = 1;
      objectPositions[index2] = this.positionHistory[j][0];
      objectPositions[index2 + 1] = this.positionHistory[j][1];
      objectPositions[index2 + 2] = -1;

      objectVelocities[index] = this.positionHistory[j][4];
      objectVelocities[index + 1] = this.positionHistory[j][5];
      objectVelocities[index + 2] = 0;
      objectVelocities[index2] = this.positionHistory[j][4];
      objectVelocities[index2 + 1] = this.positionHistory[j][5];
      objectVelocities[index2 + 2] = 0;

      index = i;
      index2 = i + il;

      objectRotations[index] = this.positionHistory[j][2];
      objectRotations[index2] = this.positionHistory[j][2];

      objectRolls[index] = this.positionHistory[j][3];
      objectRolls[index2] = this.positionHistory[j][3];
    }

    this.geometry.attributes.objectPositions.needsUpdate = true;
    this.geometry.attributes.objectVelocities.needsUpdate = true;
    this.geometry.attributes.objectRotations.needsUpdate = true;
    this.geometry.attributes.objectRolls.needsUpdate = true;
  }
}