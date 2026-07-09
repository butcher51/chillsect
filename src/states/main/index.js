import State from "../../engine/state.js";

import Lights from "./lights.js";
import StarField from "./gameObjects/starfield.js";
import ParticleSystems from "./particleSystems.js";
import Ship from "./gameObjects/ship.js";
import WeaponsController from "./weaponsController.js";
import MissionController from "./missionController.js";
import Loots from "./gameObjects/loots/loots.js";
import World from "./world.js";
import Player from "./player.js";
import Sounds from "./sounds.js";
import PhysicsWatcher from "./physicsWatcher.js";
import Portal from "./gameObjects/portal.js";
import ShipConsole from "./console.js";
import ControlPanel from "./controlPanel.js";
import LevelManager from "../../engine/levelmanager.js";
import CONFIG from "../../config.js";

class Main extends State {
  constructor() {
    super();
  }

  start() {
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
  }

  initSounds() {
    this.sounds = new Sounds(this);
  }

  initMissionController() {
    this.missionController = new MissionController(this);
    this.engine.add(this.missionController);
  }

  initPlayer() {
    this.player = new Player(this);
  }

  initWeapons() {
    this.weapons = new WeaponsController(this);
  }

  initLoots() {
    this.loots = new Loots();
    this.engine.add(this.loots);
  }

  die() {
    this.ship.die();
    this.weapons.enabled = false;
  }

  initUI() {
    this.console = new ShipConsole(this);
    this.controlPanel = new ControlPanel(this);

    this.weapons.enabled = true;
    this.weapons.set(0);
    this.weapons.setSecondary(0);
  }

  watchPhysics() {
    this.physicsWatcher = new PhysicsWatcher(this);
  }

  initStarField() {
    this.starField = new StarField();
    this.engine.add(this.starField);
  }

  initParticleSystem() {
    this.particleSystems = new ParticleSystems(this);
  }

  generateWorld() {
    this.world = new World();
    this.engine.add(this.world);
  }

  initPortal() {
    this.portal = new Portal();
    this.engine.add(this.portal);
  }

  initShip() {
    this.ship = new Ship();
    this.ship.position.z = -10000;
    this.engine.add(this.ship);
  }

  addShip() {
    this.ship.position.z = -110;
    this.ship.enablePhysics();
    this.portal.out(this.ship);
  }

  restart() {
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
  }

  gameEnd() {
    LevelManager.resetLevelState();
    console.log("GAME END");
    document.location.reload();
  }

  initLights() {
    this.lights = new Lights(this);
  }

  resize() {
    if (this.starField) {
      this.starField.resize();
    }
    if (this.console) {
      this.console.resize();
    }
  }

  update() {
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
  }
}

export default Main;
