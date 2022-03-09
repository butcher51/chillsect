import GameObject from '../../../../engine/gameobject';
import CONFIG from '../../../../config';
import { Game } from '../../../..';

export default class AbstractEnemy extends GameObject {
  public targetCursor: number[];
  public startPosition: number[];
  public target: number[];
  public size: number;
  public hp: number;
  public aleas: number[];

  public drag = 0.98;
  public collisionMask = CONFIG.COLLISION_MASK.ENEMY;
  public clickSize = 0;
  public dieRemoveCallback: any;

  constructor() {
    super();

    this.visible = false;
    this.targetCursor = [0, 0];
    this.startPosition = [0, 0];
    this.target = [0, 0];
    this.size = 10;
    this.hp = 10;
    this.sounds = {};
  }

  public setAleas(aleas) {
    this.aleas = aleas.slice();
  }

  public hit(gameObject) {
    if (this.hp === -1) {
      return;
    }

    if (this.hp > 0) {
      this.hp -= gameObject.strength;
      if (this.hp < 0) {
        this.hp = 0;
      }
    }

    if (this.hp === 0) {
      this.die();
      this.loot();
      this.hp = -1;
      this.playSound('death');
    } else {
      this.state.particleSystems.enemyHit(gameObject);
      this.playSound('impact');
    }
  }

  public playSound(key) {
    if (!Game.engine.sound) {
      return;
    }

    var s = this.sounds[key];
    for (var i = 0, l = s.length; i < l; i++) {
      if (s[i].isPlaying === true) {
        continue;
      }
      s[i].play();
      return;
    }
  }

  public loot() {
    setTimeout(() => {
      if (this.aleas[9] < 0.2) {
        this.state.loots.spawn(this, CONFIG.LOOTS.ENERGY);
      }
      for (var i = 0, il = Number.parseInt('' + this.aleas[10] * 10); i < il; i++) {
        this.state.loots.spawn(this, CONFIG.LOOTS.MONEY);
      }
    }, 100);
  }

  public die() {
    this.state.particleSystems.explodeEnemy(this);

    this.disable();

    this.state.player.enemyKilled++;

    if (this.dieRemoveCallback) {
      this.dieRemoveCallback(this);
    }
  }

  public ready() {
    this.startPosition[0] = this.targetCursor[0] = this.body.position[0];
    this.startPosition[1] = this.targetCursor[1] = this.body.position[1];
  };
}
