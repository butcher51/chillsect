import State from "../../engine/state";

import Lights from "./lights";
import StarField from "./gameObjects/starfield";
import ParticleSystems from "./particleSystems";
import Ship from "./gameObjects/ship";
import WeaponsController from "./weaponsController";
import MissionController from "./missionController";
import Loots from "./gameObjects/loots/loots";
import World from "./world";
import Player from "./player";
import Sounds from "./sounds";
import PhysicsWatcher from "./physicsWatcher";
import Portal from "./gameObjects/portal";
import ShipConsole from "./console";
import ControlPanel from "./controlPanel";
import LevelManager from "../../engine/levelmanager";
import CONFIG from "../../config";

var Main = function() {
  State.call(this);
};

Main.prototype = Object.create(State.prototype);
Main.prototype.constructor = Main;

Main.prototype.start = function() {
  this.initPlayer();

  this.initLights();

  this.initSounds();

  this.initStarField();

  this.initParticleSystem();

  this.initShip();

  this.initWeapons();

  this.initLoots();

  setTimeout(this.watchPhysics.bind(this), 200);

  setTimeout(this.initPortal.bind(this), 300);

  setTimeout(this.generateWorld.bind(this), 500);

  setTimeout(this.addShip.bind(this), 1200);

  setTimeout(this.initMissionController.bind(this), 3800);

  setTimeout(this.initUI.bind(this), 4000);
};

Main.prototype.initSounds = function() {
  this.sounds = new Sounds(this);
};

Main.prototype.initMissionController = function() {
  this.missionController = new MissionController(this);
  this.engine.add(this.missionController);
};

Main.prototype.initPlayer = function() {
  this.player = new Player(this);
};

Main.prototype.initWeapons = function() {
  this.weapons = new WeaponsController(this);
};

Main.prototype.initLoots = function() {
  this.loots = new Loots();
  this.engine.add(this.loots);
};

Main.prototype.die = function() {
  this.ship.die();
  this.weapons.enabled = false;
};

Main.prototype.initUI = function() {
  this.console = new ShipConsole(this);
  this.controlPanel = new ControlPanel(this);

  this.weapons.enabled = true;
  this.weapons.set(0);
  this.weapons.setSecondary(0);
};

Main.prototype.watchPhysics = function() {
  this.physicsWatcher = new PhysicsWatcher(this);
};

Main.prototype.initStarField = function() {
  this.starField = new StarField();
  this.engine.add(this.starField);
};

Main.prototype.initParticleSystem = function() {
  this.particleSystems = new ParticleSystems(this);
};

Main.prototype.generateWorld = function() {
  this.world = new World();
  this.engine.add(this.world);
};

Main.prototype.initPortal = function() {
  this.portal = new Portal();
  this.engine.add(this.portal);
};

Main.prototype.initShip = function() {
  this.ship = new Ship();
  this.ship.position.z = -10000;
  this.engine.add(this.ship);
};

Main.prototype.addShip = function() {
  this.ship.position.z = -110;
  this.ship.enablePhysics();
  this.portal.out(this.ship);
};

Main.prototype.restart = function() {
  console.log("restart");

  this.engine.pause();
  this.engine.reset();

  this.controlPanel.reset();
  this.console.reset();

  delete this.ship;
  delete this.portal;
  delete this.player;
  delete this.particleSystems;
  delete this.physicsWatcher;
  delete this.starField;
  delete this.loots;
  delete this.lights;
  delete this.console;
  delete this.controlPanel;
  delete this.missionController;
  delete this.sounds;
  delete this.world;

  this.engine.loader.loadLevel(
    "levels/" + LevelManager.getLevelState().level + ".json",
    levelData => {
      this.engine.loader.load(levelData.assets, () => {
        this.engine.resume();
        this.start();
      });
    }
  );
};

Main.prototype.gameEnd = function() {
  LevelManager.resetLevelState();
  console.log("GAME END");
  document.location.reload();
};

Main.prototype.initLights = function() {
  this.lights = new Lights(this);
};

Main.prototype.resize = function() {
  if (this.starField) {
    this.starField.resize();
  }
  if (this.console) {
    this.console.resize();
  }
};

Main.prototype.update = function() {
  if (this.ship) {
    this.ship.update();
    if (this.ship.active === true) {
      this.engine.scene.camera.position.x +=
        (this.ship.position.x - this.engine.scene.camera.position.x) * 0.2;
      this.engine.scene.camera.position.y +=
        (this.ship.position.y - this.engine.scene.camera.position.y) * 0.2;

      this.starField.position.x = this.engine.scene.camera.position.x;
      this.starField.position.y = this.engine.scene.camera.position.y;

      if (this.missionController) {
        this.missionController.update();
      }

      // window.shipX = this.engine.scene.camera.position.x;
      // window.shipY = this.engine.scene.camera.position.y;
    }
  }

  this.starField.update();
  if (this.world) {
    this.world.update();
  }
  this.loots.update();
  this.particleSystems.update();

  if (this.physicsWatcher) {
    this.physicsWatcher.update();
  }

  this.weapons.update();
  this.lights.update();

  if (this.portal) {
    this.portal.update();
  }
};

export default Main;
