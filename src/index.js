console.clear();

import './style.css';

import Engine from "./engine/engine.js";
import Preload from "./states/preload";
import Main from "./states/main";

window.onload = function () {

    setTimeout(function () {

        window.game = new (function () {

            this.engine = new Engine();

            this.engine.states.add('preload', new Preload());
            this.engine.states.add('main', new Main());

            this.engine.states.start('preload');

        })();

        function animate(time) {
            requestAnimationFrame(animate);
            window.game.engine.update(time);
        }

        animate();

    }, 1);

};
