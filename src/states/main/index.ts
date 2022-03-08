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
import { Game } from "../..";

export default class Main extends State {

  public sounds: any;
  public missionController: any;
  public player: Player;
  public weapons: any;
  public loots: any;
  public ship: any;
  public console: any;
  public controlPanel: any;
  public physicsWatcher: any;
  public starField: StarField;
  public particleSystems: any;
  public world: any;
  public portal: any;
  public lights: any;

  public start(): void {
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

    // setTimeout(this.generateWorld.bind(this), 500);

    setTimeout(this.addShip.bind(this), 1200);

    // setTimeout(this.initMissionController.bind(this), 3800);

    // setTimeout(this.initUI.bind(this), 4000);
  }

  public initSounds() {
    this.sounds = new Sounds(this);
  };

  public initMissionController() {
    this.missionController = new MissionController(this);
    Game.engine.add(this.missionController);
  };

  public initPlayer() {
    this.player = new Player(this);
  };

  public initWeapons() {
    this.weapons = new WeaponsController(this);
  };

  public initLoots() {
    this.loots = new Loots();
    Game.engine.add(this.loots);
  };

  public die() {
    this.ship.die();
    this.weapons.enabled = false;
  };

  public initUI() {
    this.console = new ShipConsole(this);
    this.controlPanel = new ControlPanel();

    this.weapons.enabled = true;
    this.weapons.set(0);
    this.weapons.setSecondary(0);
  };

  public watchPhysics() {
    this.physicsWatcher = new PhysicsWatcher(this);
  };

  public initStarField() {
    this.starField = new StarField();
    Game.engine.add(this.starField);
  };

  public initParticleSystem() {
    this.particleSystems = new ParticleSystems();
  };

  public generateWorld() {
    this.world = new World();
    Game.engine.add(this.world);
  };

  public initPortal() {
    this.portal = new Portal();
    Game.engine.add(this.portal);
  };

  public initShip() {
    this.ship = new Ship();
    this.ship.position.z = -10000;
    Game.engine.add(this.ship);
  };

  public addShip() {
    this.ship.position.z = -110;
    this.ship.enablePhysics();
    this.portal.out(this.ship);
  };

  public restart() {
    console.log("restart");

    Game.engine.pause();
    Game.engine.reset();

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

    Game.engine.loader.loadLevel(
      "levels/" + LevelManager.getLevelState().level + ".json",
      levelData => {
        Game.engine.loader.load(levelData.assets, () => {
          Game.engine.resume();
          this.start();
        });
      }
    );
  };

  public gameEnd() {
    LevelManager.resetLevelState();
    console.log("GAME END");
    document.location.reload();
  };

  public initLights() {
    this.lights = new Lights();
  };

  public resize() {
    if (this.starField) {
      this.starField.resize();
    }
    if (this.console) {
      this.console.resize();
    }
  };

  public update() {
    if (this.ship) {
      this.ship.update();
      if (this.ship.active === true) {
        Game.engine.scene.camera.position.x +=
          (this.ship.position.x - Game.engine.scene.camera.position.x) * 0.2;
        Game.engine.scene.camera.position.y +=
          (this.ship.position.y - Game.engine.scene.camera.position.y) * 0.2;

        this.starField.position.x = Game.engine.scene.camera.position.x;
        this.starField.position.y = Game.engine.scene.camera.position.y;

        if (this.missionController) {
          this.missionController.update();
        }

        // window.shipX = Game.engine.scene.camera.position.x;
        // window.shipY = Game.engine.scene.camera.position.y;
      }
    }

    this.starField?.update(0);
    this.world?.update();
    this.loots?.update();
    this.particleSystems?.update();
    this.physicsWatcher?.update();
    this.weapons?.update();
    this.portal?.update();

  }

};

