import State from '../engine/state';
import Util from '../util';
import LevelManager from "../engine/levelmanager";

var Preload = function () {

    State.call(this);

};

Preload.prototype = Object.create(State.prototype);
Preload.prototype.constructor = Preload;

Preload.prototype.start = function (params) {

    console.log('Preload started');

    this.params = params;

    this.engine.loader.loadLevel("levels/" + LevelManager.getLevelState().level + ".json", this.levelLoadedCallback.bind(this));


};

Preload.prototype.levelLoadedCallback = function (levelData) {

    var assets = Util.mergeObjects(this.commonAssets, levelData.assets);

    this.engine.loader.load(assets, this.loaded.bind(this));

};

Preload.prototype.loaded = function () {
    var loader = document.getElementById('loader');
    loader.innerHTML = 'Start mission ' + Util.add0(LevelManager.getLevelState().level);
    loader.style.color = '#009bff';
    loader.style.cursor = 'pointer';
    loader.onclick = () => {
        loader.parentNode.removeChild(loader);
        this.engine.states.start('main');
        this.engine.initStats();
    }
};

Preload.prototype.stop = function () {
    console.log('Preload finished');
};

Preload.prototype.commonAssets = {
    asteroidTexture: 'textures/asteroid.jpg',
    asteroidImpact1Sound: 'sounds/asteroidImpact1.ogg',
    asteroidExplode1Sound: 'sounds/asteroidExplode1.ogg',
    arrow: 'models/arrow.buffer.json',
    ship01model: 'models/ship01.buffer.json',
    ship01texture: 'textures/ship01.png',
    ship01Propulsion01model: 'models/ship01_propulsion01.buffer.json',
    ship01Propulsion01texture: 'textures/ship01_propulsion01.png',
    ship01Propulsion02model: 'models/ship01_propulsion02.buffer.json',
    ship01Propulsion02texture: 'textures/ship01_propulsion02.png',
    ship01Propulsion03texture: 'textures/ship01_propulsion03.png',
    shipEngine: 'sounds/shipEngine.ogg',
    powerupEnergyTexture: 'textures/powerup_energy2.png',
    shipExplode: 'sounds/shipExplode.ogg',
    energyShield: 'sounds/energyShield.ogg',
    ship01shield01: 'textures/ship01_shield1.png',
    starField0Background: 'textures/starField0_background.jpg',
    starField0Layer1: 'textures/starField0_layer1.png',
    starField0Clouds: 'textures/starField0_clouds.png',
    portalModel: 'models/portal01.buffer.json',
    portalModel2: 'models/portal02.buffer.json',
    portalTexture: 'textures/portal.png',
    portal2Texture: 'textures/portal2.png',
    portal2Emissive: 'textures/portal2emissive.png',
    asteroid01Model: 'models/asteroid01.buffer.json',
    icoModel: 'models/ico.buffer.json',
    icosModel: 'models/icos.buffer.json',
    basicWeaponModel: 'models/basicWeapon.buffer.json',
    basicWeaponSound: 'sounds/basicWeapon.ogg',
    gatlingWeaponModel: 'models/gatlingGun.buffer.json',
    gatlingWeaponSound: 'sounds/gatlingWeapon.ogg',
    redPlasmaWeaponModel: 'models/redPlasmaGun.buffer.json',
    emeraldWeaponModel: 'models/emeraldGun.buffer.json',
    particle02: 'textures/particle02.png',
    enemy01ModelAnim: 'models/enemy01.scene.json',
    enemy01Texture: 'textures/enemy01.png',
    enemy01HitSound: 'sounds/enemyHit1.ogg',
    enemy01DeathSound: 'sounds/enemyDeath1.ogg',
    enemy00ModelAnim: 'models/enemy00.scene.json',
    enemy00Texture: 'textures/enemy00.png',
    powerup1Sound: 'sounds/powerup1.ogg',
    powerup2Sound: 'sounds/powerup2.ogg',
    warning1Sound: 'sounds/warning1.ogg',
    crystalModel: 'models/crystal.buffer.json',
    portalSound: 'sounds/portal.ogg',
    clickSound: 'sounds/click.ogg',
    energyDown: 'sounds/energyDown.ogg',
    fusionGun: 'sounds/fusionGun.ogg',
    fusionGunModel: 'models/fusionGun.buffer.json',
    fusionBeamEnd2Texture: 'textures/fusionBeamEnd2Texture.png',
    rpgRocketModel: 'models/rpgRocket.buffer.json',
    rpgRocketTexture: 'textures/rpgRocket.png',
    contrailTexture: 'textures/contrail.png',
    missile1Sound: 'sounds/missile1.ogg',
    starfieldReflection: 'textures/starfieldReflection.png',
    kyberCrystal: 'textures/kyberCrystal.png',
    weaponsTexture: 'textures/weapons.png'
};

export default Preload;