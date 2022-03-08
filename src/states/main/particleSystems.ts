import { Vector3, Vector2, NormalBlending, RepeatWrapping, AdditiveBlending, PointLight } from 'three';

import TWEEN from '@tweenjs/tween.js';
import { Game } from '../..';
import SPE from '../../engine/SPE';

export default class ParticleSystems {
  groups: {};
  emitters: {};
  groupConfigs: any;
  lightBuffer: any[];
  lightIndex: number;
  gameObject: any;
  intensity: number;
  c: number;

  constructor() {
    this.init();
  }

  public static types = {
    redLaserBullet: 'redLaserBullet',
    grayAsteroidFog: 'grayAsteroidFog',
    shipExplosion: 'shipExplosion',
    asteroidExplosion: 'asteroidExplosion',
    enemyDeathA: 'enemyDeathA',
    enemyDeathB: 'enemyDeathB',
    rocketExplosion: 'rocketExplosion'
  };

  public init() {
    this.groups = {};
    this.emitters = {};

    this.groupConfigs = this.getGroupConfigs();

    for (var key in this.groupConfigs) {
      if (this.groupConfigs.hasOwnProperty(key)) {
        var groupConfig = this.groupConfigs[key];
        var group = new SPE.Group(groupConfig);

        for (var i = 0, l = groupConfig.emittersBufferLength; i < l; i++) {
          if (!this.emitters[key]) {
            this.emitters[key] = [];
          }
          this.emitters[key][i] = new SPE.Emitter(this.emitterConfigs[key]);
          this.emitters[key][i].disable();
          this.emitters[key][i].exIndex = i;
          group.addEmitter(this.emitters[key][i]);
        }

        group.emitterIndex = 0;
        group.mesh.frustumCulled = false;
        Game.engine.scene.scene.add(group.mesh);

        this.groups[key] = group;
      }
    }

    this.initLightBuffer();
  }

  public getGroupConfigs() {
    var t = Game.engine.loader.resources['particle02'].texture;

    return {
      //blueLaserBullet: {
      //    texture: {value: this.engine.loader.resources['particle01'].texture},
      //    maxParticleCount: 100,
      //    colorize: false,
      //    emittersBufferLength: 1
      //},
      redLaserBullet: {
        texture: {
          value: t,
          crop: new Vector2(0.75, 0.75)
        },
        maxParticleCount: 800,
        colorize: false,
        emittersBufferLength: 4
      },
      grayAsteroidFog: {
        texture: {
          value: t,
          crop: new Vector2(0.25, 1)
        },
        maxParticleCount: 50,
        colorize: false,
        emittersBufferLength: 2
      },
      shipExplosion: {
        texture: {
          value: t,
          crop: new Vector2(0.25, 0.5)
        },
        maxParticleCount: 200,
        colorize: false,
        emittersBufferLength: 1
      },
      asteroidExplosion: {
        texture: {
          value: t,
          crop: new Vector2(0.75, 1)
        },
        maxParticleCount: 300,
        colorize: false,
        emittersBufferLength: 3
      },
      enemyDeathA: {
        texture: {
          value: t,
          crop: new Vector2(1, 0.75)
        },
        maxParticleCount: 300,
        blending: NormalBlending,
        colorize: false,
        emittersBufferLength: 3
      },
      enemyDeathB: {
        texture: {
          value: t,
          crop: new Vector2(0.75, 0.5)
        },
        maxParticleCount: 300,
        colorize: false,
        blending: AdditiveBlending,
        emittersBufferLength: 3
      },
      rocketExplosion: {
        texture: {
          value: t,
          crop: new Vector2(0.75, 1)
        },
        maxParticleCount: 300,
        colorize: false,
        emittersBufferLength: 3
      }
    };
  }

  public emitterConfigs = {
    //blueLaserBullet: {
    //    type: SPE.distributions.SPHERE,
    //    maxAge: {
    //        value: 0.5
    //    },
    //    position: {
    //        value: new Vector3(0, 0, 0)
    //    },
    //    acceleration: {
    //        value: new Vector3(-600, 0, 0),
    //        spread: new Vector3(-400, 0, 0)
    //    },
    //    opacity: {
    //        value: 1
    //    },
    //    velocity: {
    //        value: new Vector3(800, 0, 0)
    //    },
    //    size: {
    //        value: [10, 1],
    //        spread: 10
    //    },
    //    particleCount: 100
    //},
    redLaserBullet: {
      type: SPE.distributions.SPHERE,
      maxAge: {
        value: 0.5
      },
      position: {
        value: new Vector3(0, 0, 0)
      },
      acceleration: {
        value: new Vector3(-600, 0, 0),
        spread: new Vector3(-400, 0, 0)
      },
      opacity: {
        value: 1
      },
      velocity: {
        value: new Vector3(800, 0, 0)
      },
      size: {
        value: [20, 1],
        spread: 10
      },
      particleCount: 100
    },
    grayAsteroidFog: {
      type: SPE.distributions.SPHERE,
      maxAge: {
        value: 3
      },
      position: {
        value: new Vector3(0, 0, 10)
      },
      acceleration: {
        value: new Vector3(-40, 0, 0)
      },
      angle: {
        value: 1,
        randomise: true
      },
      opacity: {
        value: [1, 0]
      },
      velocity: {
        value: new Vector3(200, 0, 0)
      },
      size: {
        value: [100, 500]
      },
      particleCount: 25
    },
    shipExplosion: {
      type: SPE.distributions.SPHERE,
      maxAge: {
        value: 1
      },
      acceleration: {
        value: new Vector3(-100, 0, 0)
      },
      opacity: {
        value: [1, 1, 0]
      },
      velocity: {
        value: new Vector3(300, 0, 0),
        spread: new Vector3(300, 0, 0)
      },
      size: {
        value: [60, 20],
        spread: 50
      },
      particleCount: 200
    },
    asteroidExplosion: {
      type: SPE.distributions.SPHERE,
      maxAge: {
        value: 1
      },
      position: {
        radius: 200
      },
      acceleration: {
        value: new Vector3(250, 0, 0)
      },
      drag: {
        value: 0.4
      },
      opacity: {
        value: [1, 1, 0]
      },
      velocity: {
        value: new Vector3(120, 0, 0),
        spread: new Vector3(120, 0, 0)
      },
      size: {
        value: [200, 60],
        spread: 150
      },
      particleCount: 50
    },
    enemyDeathA: {
      type: SPE.distributions.SPHERE,
      maxAge: {
        value: 1
      },
      position: {
        radius: 50
      },
      acceleration: {
        value: new Vector3(-100, 0, 0)
      },
      opacity: {
        value: [1, 0]
      },
      velocity: {
        value: new Vector3(300, 0, 0),
        spread: new Vector3(300, 0, 0)
      },
      size: {
        value: [120, 20],
        spread: 80
      },
      particleCount: 100
    },
    enemyDeathB: {
      type: SPE.distributions.SPHERE,
      maxAge: {
        value: 1
      },
      acceleration: {
        value: new Vector3(-100, 0, 0)
      },
      opacity: {
        value: [1, 0]
      },
      velocity: {
        value: new Vector3(300, 0, 0),
        spread: new Vector3(300, 0, 0)
      },
      size: {
        value: [50, 20],
        spread: 30
      },
      particleCount: 100
    },
    rocketExplosion: {
      type: SPE.distributions.SPHERE,
      maxAge: {
        value: 1
      },
      acceleration: {
        value: new Vector3(-100, 0, 0)
      },
      opacity: {
        value: [1, 1, 0]
      },
      velocity: {
        value: new Vector3(300, 0, 0),
        spread: new Vector3(300, 0, 0)
      },
      size: {
        value: [200, 60],
        spread: 150
      },
      particleCount: 50
    }
  };

  public initLightBuffer() {
    this.lightBuffer = [];
    this.lightIndex = 0;
    for (var i = 0, len = 3; i < len; i++) {
      var light = new PointLight(0xff0000, 0, 2000);
      light.position.z = 200;
      this.lightBuffer.push(light);
      Game.engine.scene.scene.add(light);
    }
  }

  public getLightFromBuffer = function () {
    if (this.lightIndex === this.lightBuffer.length) {
      this.lightIndex = 0;
    }
    return this.lightBuffer[this.lightIndex++];
  };

  public getEmitterFromBuffer = function (type) {
    var emitter = this.emitters[type][this.groups[type].emitterIndex++];
    if (this.groups[type].emitterIndex === this.groupConfigs[type].emittersBufferLength) {
      this.groups[type].emitterIndex = 0;
    }
    return emitter;
  };

  public doSingleEmit = function (type, gameObject, time) {
    var emitter = this.getEmitterFromBuffer(type);

    emitter.position.value = emitter.position.value.set(gameObject.body.position[0], gameObject.body.position[1], 5);
    emitter.enable();

    setTimeout(function () {
      emitter.disable();
      //console.log(emitter.exIndex);
    }, time);
  };

  public asteroidHit(gameObject) {
    if (gameObject.hitParticleSysType) {
      this.doSingleEmit(gameObject.hitParticleSysType, gameObject, 100);
    }
    this.doSingleEmit(ParticleSystems.types.grayAsteroidFog, gameObject, 200);
  }

  public enemyHit(gameObject) {
    if (gameObject.hitParticleSysType) {
      this.doSingleEmit(gameObject.hitParticleSysType, gameObject, 100);
    }
    this.doSingleEmit(ParticleSystems.types.enemyDeathA, gameObject, 20);
    this.doSingleEmit(ParticleSystems.types.enemyDeathB, gameObject, 20);
  }

  public explodeEnemy(gameObject) {
    this.doSingleEmit(ParticleSystems.types.enemyDeathA, gameObject, 150);
    this.doSingleEmit(ParticleSystems.types.enemyDeathB, gameObject, 150);
  }

  public explodeShip(gameObject) {
    this.doSingleEmit(ParticleSystems.types.shipExplosion, gameObject, 600);
  }

  public beforeExplodeAsteroid(gameObject) {
    var s2 = gameObject.size / 200;
    var e =
      this.emitters[ParticleSystems.types.asteroidExplosion][
        this.groups[ParticleSystems.types.asteroidExplosion].emitterIndex
      ];

    e.position.radius = 80 * s2;
    //e.acceleration.value.set(250 * s2, 0, 0);
    //e.velocity.value.set(120 * s2, 0, 0);
    //e.velocity.spread.set(120 * s2, 0, 0);ezek miért nem frissülnek?
    e.size.value[0] = 170 * s2;
    e.size.spread = 170 * s2;

    this.doSingleEmit(ParticleSystems.types.asteroidExplosion, gameObject, 50);
    this.flashLight(gameObject, 10, 2);
  }

  public flashLightTweenOnUpdate() {
    if (this.gameObject.explodeLight) {
      this.gameObject.explodeLight.intensity = this.c > this.intensity / 2 ? Math.abs(this.intensity - this.c) : this.c;
    }
  }

  public flashLightTweenOnComplete() {
    if (this.gameObject.explodeLight) {
      this.gameObject.explodeLight.intensity = 0;
    }
  }

  public flashLight(gameObject, intensity, time) {
    if (!gameObject.explodeLight) {
      gameObject.explodeLight = this.getLightFromBuffer();
    }
    gameObject.explodeLight.position.set(gameObject.position.x, gameObject.position.y, 200);
    new TWEEN.Tween({ gameObject: gameObject, intensity: intensity, c: gameObject.explodeLight.intensity })
      .to({ c: intensity }, time)
      .onUpdate(this.flashLightTweenOnUpdate)
      .onComplete(this.flashLightTweenOnComplete)
      .easing(TWEEN.Easing.Quintic.Out)
      .start(Game.engine.time);
  }

  public explodeAsteroid(gameObject) {
    var s2 = gameObject.size / 200;
    var e =
      this.emitters[ParticleSystems.types.asteroidExplosion][
        this.groups[ParticleSystems.types.asteroidExplosion].emitterIndex
      ];
    e.position.radius = 100 * s2;
    //e.acceleration.value.set(250 * s2, 0, 0);
    //e.velocity.value.set(120 * s2, 0, 0);
    //e.velocity.spread.set(120 * s2, 0, 0);ezek miért nem frissülnek?
    e.size.value[0] = 170 * s2;
    e.size.spread = 170 * s2;

    this.doSingleEmit(ParticleSystems.types.asteroidExplosion, gameObject, 500);
    this.flashLight(gameObject, 20, 4);
  }
  public followShipWithEmitter(gameObject) {
    var emitter =
      this.emitters[ParticleSystems.types.shipExplosion][this.groups[ParticleSystems.types.shipExplosion].emitterIndex];
    emitter.position.value = emitter.position.value.set(gameObject.position.x, gameObject.position.y, 5);
  }

  public followExplodeEnemy(gameObject) {
    var emitter = this.getEmitterFromBuffer(ParticleSystems.types.enemyDeathA);
    emitter.position.value = emitter.position.value.set(gameObject.position.x, gameObject.position.y, 5);

    emitter = this.getEmitterFromBuffer(ParticleSystems.types.enemyDeathB);
    emitter.position.value = emitter.position.value.set(gameObject.position.x, gameObject.position.y, 5);
  }

  public update() {
    for (var key in this.groupConfigs) {
      if (this.groupConfigs.hasOwnProperty(key)) {
        this.groups[key].tick(Game.engine.delta);
      }
    }
  }
}
