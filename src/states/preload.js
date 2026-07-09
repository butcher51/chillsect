import State from "../engine/state.js";
import Util from "../util.js";
import LevelManager from "../engine/levelmanager.js";

class Preload extends State {
	commonAssets = {
		asteroidTexture: "textures/asteroid.jpg",
		asteroidImpact1Sound: "sounds/asteroidImpact1.ogg",
		asteroidExplode1Sound: "sounds/asteroidExplode1.ogg",
		arrow: "models/arrow.buffer.json",
		ship01model: "models/ship01.buffer.json",
		ship01texture: "textures/ship01.png",
		ship01Propulsion01model: "models/ship01_propulsion01.buffer.json",
		ship01Propulsion01texture: "textures/ship01_propulsion01.png",
		ship01Propulsion02model: "models/ship01_propulsion02.buffer.json",
		ship01Propulsion02texture: "textures/ship01_propulsion02.png",
		ship01Propulsion03texture: "textures/ship01_propulsion03.png",
		shipEngine: "sounds/shipEngine.ogg",
		powerupEnergyTexture: "textures/powerup_energy2.png",
		shipExplode: "sounds/shipExplode.ogg",
		energyShield: "sounds/energyShield.ogg",
		ship01shield01: "textures/ship01_shield1.png",
		starField0Background: "textures/starField0_background.jpg",
		starField0Layer1: "textures/starField0_layer1.png",
		starField0Clouds: "textures/starField0_clouds.png",
		portalModel: "models/portal01.buffer.json",
		portalModel2: "models/portal02.buffer.json",
		portalTexture: "textures/portal.png",
		portal2Texture: "textures/portal2.png",
		portal2Emissive: "textures/portal2emissive.png",
		asteroid01Model: "models/asteroid01.buffer.json",
		icoModel: "models/ico.buffer.json",
		icosModel: "models/icos.buffer.json",
		basicWeaponModel: "models/basicWeapon.buffer.json",
		basicWeaponSound: "sounds/basicWeapon.ogg",
		gatlingWeaponModel: "models/gatlingGun.buffer.json",
		redPlasmaWeaponModel: "models/redPlasmaGun.buffer.json",
		emeraldWeaponModel: "models/emeraldGun.buffer.json",
		particle02: "textures/particle02.png",
		enemy01ModelAnim: "models/enemy01.scene.json",
		enemy01Texture: "textures/enemy01.png",
		enemy01HitSound: "sounds/enemyHit1.ogg",
		enemy01DeathSound: "sounds/enemyDeath1.ogg",
		enemy00ModelAnim: "models/enemy00.scene.json",
		enemy00Texture: "textures/enemy00.png",
		powerup1Sound: "sounds/powerup1.ogg",
		powerup2Sound: "sounds/powerup2.ogg",
		warning1Sound: "sounds/warning1.ogg",
		crystalModel: "models/crystal.buffer.json",
		portalSound: "sounds/portal.ogg",
		clickSound: "sounds/click.ogg",
		energyDown: "sounds/energyDown.ogg",
		fusionGun: "sounds/fusionGun.ogg",
		fusionGunModel: "models/fusionGun.buffer.json",
		fusionBeamEnd2Texture: "textures/fusionBeamEnd2Texture.png",
		rpgRocketModel: "models/rpgRocket.buffer.json",
		rpgRocketTexture: "textures/rpgRocket.png",
		contrailTexture: "textures/contrail.png",
		missile1Sound: "sounds/missile1.ogg",
		starfieldReflection: "textures/starfieldReflection.png",
		kyberCrystal: "textures/kyberCrystal.png",
		weaponsTexture: "textures/weapons.png",
		enemy02Texture: "textures/enemy02.png",
	};

	constructor() {
		super();
	}

	start(params) {
		console.log("Preload started");

		this.params = params;

		this.engine.loader.loadLevel("levels/" + LevelManager.getLevelState().level + ".json", this.levelLoadedCallback.bind(this));
	}

	levelLoadedCallback(levelData) {
		var assets = Util.mergeObjects(this.commonAssets, levelData.assets);

		this.engine.loader.load(assets, this.loaded.bind(this));
	}

	loaded() {
		var loader = document.getElementById("loader");
		loader.innerHTML = "";

		var startMission = document.createElement("div");
		startMission.classList.add("loaderLink");
		startMission.innerHTML = "Start mission " + Util.add0(LevelManager.getLevelState().level);
		startMission.style.cursor = "pointer";
		startMission.onclick = () => {
			// Browsers create the WebAudio context suspended until a user gesture.
			// This click is that gesture, so resume it here or no sound ever plays.
			const audioCtx = this.engine.audioListener && this.engine.audioListener.context;
			if (audioCtx && audioCtx.state === "suspended") {
				audioCtx.resume();
			}

			loader.parentNode.removeChild(loader);
			this.engine.states.start("main");
			this.engine.initStats();
		};
		loader.appendChild(startMission);

		var disableSound = document.createElement("div");
		disableSound.classList.add("loaderLink");
		disableSound.innerHTML = "Disable sound";
		disableSound.style.marginTop = "60px";
		disableSound.style.cursor = "pointer";
		disableSound.style.fontSize = "20px";
		disableSound.onclick = () => {
			this.engine.sound = !this.engine.sound;
			if (this.engine.sound) {
				disableSound.innerHTML = "Disable sound";
			} else {
				disableSound.innerHTML = "Enable sound";
			}
		};
		loader.appendChild(disableSound);
	}

	stop() {
		console.log("Preload finished");
	}
}

export default Preload;
