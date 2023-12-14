import Main from '.';
import { Game } from '../..';
import LevelManager from '../../engine/levelmanager';
import Util from '../../util';

export default class ControlPanel {
  wrapper: any;
  state: Main;

  constructor() {
    this.appendHtml();
    this.initSounds();
  }

  public initSounds() {}
  public appendHtml() {
    var this_ = this;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        var wrapper = document.createElement('div');
        wrapper.style.display = 'none';
        wrapper.id = 'controlPanel';
        wrapper.innerHTML = xhttp.responseText;
        document.body.appendChild(wrapper);
        this_.wrapper = wrapper;
        this_.init();
      }
    };
    xhttp.open('GET', document.location.href + 'controlPanel.html', true);
    xhttp.send();
  }

  public showLevelComplete() {
    this.show();

    (document.querySelector('#controlPanel .header .close') as HTMLDivElement).style.display = 'none';
    (document.querySelector('#uiWrapper .controlPanelBtn') as HTMLDivElement).onclick = null;

    this.state.sounds.play('warning1');

    (document.querySelector('#controlPanel .menu') as HTMLDivElement).style.display = 'none';

    var contents = document.querySelectorAll('#controlPanel .contents .content');
    for (var i = 0, len = contents.length; i < len; i++) {
      (contents[i] as HTMLDivElement).style.display = 'none';
    }

    (document.querySelector('#controlPanel .contents .levelComplete') as HTMLDivElement).style.display = 'block';

    (document.querySelector('#kyberCrystalCollected') as HTMLDivElement).innerHTML =
      '' + this.state.player.kyberCrystal;
    (document.querySelector('#creditCollected') as HTMLDivElement).innerHTML = '' + this.state.player.money;
    (document.querySelector('#enemyKilled') as HTMLDivElement).innerHTML = '' + this.state.player.enemyKilled;
    (document.querySelector('#objectDestroyed') as HTMLDivElement).innerHTML = '' + this.state.player.objectDestroyed;

    if (LevelManager.isGameEnd()) {
      (document.querySelector('#nextLevelBtn') as HTMLDivElement).style.display = 'none';
      (document.querySelector('#gameEndBtn') as HTMLDivElement).style.display = 'block';
      (document.querySelector('#gameEndBtn') as HTMLDivElement).onclick = () => {
        this.state.gameEnd();
      };
    } else {
      (document.querySelector('#gameEndBtn') as HTMLDivElement).style.display = 'none';
      var nextLevelBtn = document.querySelector('#nextLevelBtn') as HTMLDivElement;
      nextLevelBtn.style.display = 'block';
      nextLevelBtn.innerHTML = '<span>Start mission ' + Util.add0(LevelManager.getLevelState().level) + '</span>';
      nextLevelBtn.onclick = () => {
        //this.state.restart();
        document.location.reload();
      };
    }
  }

  public toggle() {
    if (this.wrapper.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  }

  public show() {
    Game.engine.pause();
    this.wrapper.style.display = 'block';

    if (this.state.ship.sounds.engine.isPlaying) {
      this.state.ship.sounds.engine.gain.gain.value = 0;
      this.state.ship.sounds.engine.pause();
    }

    this.state.sounds.play('click');
    this.updateView();
  }
  public hide() {
    Game.engine.resume();
    this.wrapper.style.display = 'none';
    this.state.sounds.play('click');
  }

  public updateView() {}
  public reset() {
    document.getElementById('controlPanel').remove();
  }

  public showMsg = function (content) {
    var wrapper = document.createElement('div');
    wrapper.className = 'messageBox';

    var wrapper1 = document.createElement('div');

    var footer = document.createElement('div');
    footer.className = 'footer';

    var close = document.createElement('a');
    close.className = 'close';
    wrapper.onclick = () => {
      document.body.removeChild(wrapper);
      this.state.sounds.play('click');
    };

    wrapper.appendChild(wrapper1);
    wrapper.appendChild(footer);

    wrapper1.appendChild(close);

    wrapper1.appendChild(content);

    document.body.appendChild(wrapper);

    wrapper.style.top = '30px';
    window.getComputedStyle(wrapper).top;
    wrapper.style.top = '100px';
  };

  public hideMsg() {
    var q = document.querySelector('.messageBox');
    if (q) {
      document.body.removeChild(q);
    }
  }

  public init() {
    var menu = document.querySelectorAll('#controlPanel .menu a');
    for (var i = 0, len = menu.length; i < len; i++) {
      (menu[i] as HTMLDivElement).onclick = this.menuClick.bind(this);
    }

    var close = document.querySelector('#controlPanel .header .close') as HTMLDivElement;
    close.onclick = this.hide.bind(this);

    (document.querySelector('#resetLevelState') as HTMLDivElement).onclick = function () {
      LevelManager.resetLevelState();
      document.location.reload();
    };

    var that = this;
    (document.querySelector('#selfDestruct') as HTMLDivElement).onclick = function () {
      that.hide();
      setTimeout(() => {
        that.state.ship.die();
      }, 250);
    };

    var that = this;
    (document.querySelector('#levelCompleteCheat') as HTMLDivElement).onclick = function () {
      that.hide();
      setTimeout(() => {
        for (var i = 0; i < that.state.missionController.kyberCrystalList.length; i++) {
          that.state.missionController.addKyberCrystal();
        }
      }, 250);
    };
  }

  public menuClick = function (e) {
    var contents = document.querySelectorAll('#controlPanel .contents .content');
    for (var i = 0, len = contents.length; i < len; i++) {
      (contents[i] as HTMLDivElement).style.display = 'none';
    }
    var menuItems = document.querySelectorAll('#controlPanel .menu a');
    for (i = 0, len = menuItems.length; i < len; i++) {
      menuItems[i].classList.remove('active');
    }

    var content = document.querySelectorAll('#controlPanel .contents .' + e.target.className)[0] as HTMLDivElement;
    content.style.display = 'block';
    e.target.classList.add('active');

    this.state.sounds.play('click');
  };
}
