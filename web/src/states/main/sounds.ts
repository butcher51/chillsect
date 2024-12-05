import { Audio } from "three";
import { Game } from "../..";
import State from "../../engine/state";

export default class Sounds {
	private sounds: any = {};

	constructor(private state: State) {

		var warning1 = new Audio(Game.engine.audioListener);
		warning1.setBuffer(Game.engine.loader.resources["warning1Sound"].buffer);

		this.sounds.warning1 = [warning1];

		var clickSound = new Audio(Game.engine.audioListener);
		clickSound.setBuffer(Game.engine.loader.resources["clickSound"].buffer);

		this.sounds.click = [clickSound];

		var portalSound = new Audio(Game.engine.audioListener);
		portalSound.setBuffer(Game.engine.loader.resources["portalSound"].buffer);

		this.sounds.portal = [portalSound];

		var powerupSound = [];
		for (var i = 0; i < 3; i++) {
			var sound = new Audio(Game.engine.audioListener);
			sound.setBuffer(Game.engine.loader.resources["powerup1Sound"].buffer);
			powerupSound[i] = sound;
		}

		this.sounds.powerup = powerupSound;

		var pickupSound = [];
		for (var i = 0; i < 5; i++) {
			var sound = new Audio(Game.engine.audioListener);
			sound.setBuffer(Game.engine.loader.resources["powerup2Sound"].buffer);
			pickupSound[i] = sound;
		}
		this.sounds.pickup = pickupSound;

		var basicWeaponSound = [];
		for (var i = 0; i < 10; i++) {
			var sound = new Audio(Game.engine.audioListener);
			sound.setBuffer(Game.engine.loader.resources["basicWeaponSound"].buffer);
			basicWeaponSound[i] = sound;
		}
		this.sounds.basicWeapon = basicWeaponSound;

		var impactSounds = [];
		for (i = 0; i < 5; i++) {
			sound = new Audio(Game.engine.audioListener);
			sound.setBuffer(Game.engine.loader.resources["asteroidImpact1Sound"].buffer);
			impactSounds[i] = sound;
		}
		this.sounds.impact = impactSounds;

		var explodeSounds = [];
		for (i = 0; i < 2; i++) {
			sound = new Audio(Game.engine.audioListener);
			sound.setBuffer(Game.engine.loader.resources["asteroidExplode1Sound"].buffer);
			explodeSounds[i] = sound;
		}
		this.sounds.explode = explodeSounds;

		var missile1Sounds = [];
		for (i = 0; i < 8; i++) {
			sound = new Audio(Game.engine.audioListener);
			sound.setBuffer(Game.engine.loader.resources["missile1Sound"].buffer);
			missile1Sounds[i] = sound;
		}
		this.sounds.missile1 = missile1Sounds;
	}

	public play(key): void {
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
}