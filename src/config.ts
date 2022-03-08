import { Color } from "three";

const ASSETS_FOLDER = "assets/";

const COLLISION_MASK = {
  SHIP: Math.pow(2, 1),
  PROJECTILE: Math.pow(2, 2),
  SPACE_OBJECT: Math.pow(2, 3),
  LOOT: Math.pow(2, 4),
  ENEMY: Math.pow(2, 5),
  STATIC_OBJECT: Math.pow(2, 6)
};

const PROCEDURAL_BLOCK_SIZE = 10000;

const VIEW_BUFFER_RADIUS = 2000;

const ENERGY_MANAGEMENT = {
  MOVE_ENERGY_USAGE: 0.0001,
  MIN_VALUE: 0.01,
  ENERGY_MAX_VALUE: 1,

  SHIP_IMPACT_WITH_ASTEROID: 0.0015,
  SHIP_COLLIDE_WITH_ASTEROID: 0.0005,
  SHIP_ATTACK_BY_ENEMY_00: 0.5,
  SHIP_ATTACK_BY_ENEMY_01: 0.01,
  SHIP_ATTACK_BY_ENEMY_02: 0.02,

  WARNING: 0.5,

  POWERUP_ENERGY: 0.25
};

const CHILLSECT_LEVEL_STATE_KEY = "chillsectLevelState";

const LOOTS = {
  ENERGY: { class: "PowerupEnergy", label: "Instant energy", desc: "" },
  MONEY: { class: "Money", label: "Money", desc: "" }
};

for (const key in LOOTS) {
  if (LOOTS.hasOwnProperty(key)) {
    LOOTS[key].key = key;
  }
}

const DEBUG_ENEMY_FOLLOW = false;

export default {
  MAX_LEVEL: 2,
  CHILLSECT_LEVEL_STATE_KEY: CHILLSECT_LEVEL_STATE_KEY,
  ASSETS_FOLDER: ASSETS_FOLDER,
  LOOTS: LOOTS,
  COLLISION_MASK: COLLISION_MASK,
  PROCEDURAL_BLOCK_SIZE: PROCEDURAL_BLOCK_SIZE,
  VIEW_BUFFER_RADIUS: VIEW_BUFFER_RADIUS,
  DEBUG_ENEMY_FOLLOW: DEBUG_ENEMY_FOLLOW,
  ENERGY_MANAGEMENT: ENERGY_MANAGEMENT,
  RED: new Color(1, 0.2, 0.2)
};
