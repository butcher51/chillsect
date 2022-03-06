//console.clear();

import "./style.css";

import Engine from "./engine/engine.js";
import Preload from "./states/preload";
import Main from "./states/main";

export class Game {

	public static engine: Engine;

	constructor() {

		Game.engine = new Engine();

		Game.engine.states.add("preload", new Preload());
		Game.engine.states.add("main", new Main());
	
		Game.engine.states.start("preload");
	}

}

window.onload = function() {
	setTimeout(function() {
		new Game();

		function animate(time) {
			requestAnimationFrame(animate);
			Game.engine.update(time);
		}

		animate(0);
	}, 1);
};
