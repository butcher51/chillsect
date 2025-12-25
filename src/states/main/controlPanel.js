import LevelManager from "../../engine/levelmanager";
import Util from "../../util";

var ControlPanel = function(state) {
  this.state = state;
  this.engine = state.engine;

  this.appendHtml();

  this.initSounds();
};

ControlPanel.prototype.constructor = ControlPanel;

ControlPanel.prototype.initSounds = function() {};

ControlPanel.prototype.appendHtml = function() {
  var this_ = this;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var wrapper = document.createElement("div");
      wrapper.style.display = "none";
      wrapper.id = "controlPanel";
      wrapper.innerHTML = xhttp.responseText;
      document.body.appendChild(wrapper);
      this_.wrapper = wrapper;
      this_.init();
    }
  };
  xhttp.open("GET", document.location.href + "controlPanel.html", true);
  xhttp.send();
};

ControlPanel.prototype.showLevelComplete = function() {
  this.show();

  document.querySelector("#controlPanel .header .close").style.display = "none";
  document.querySelector("#uiWrapper .controlPanelBtn").onclick = null;

  this.state.sounds.play("warning1");

  document.querySelector("#controlPanel .menu").style.display = "none";

  var contents = document.querySelectorAll("#controlPanel .contents .content");
  for (var i = 0, len = contents.length; i < len; i++) {
    contents[i].style.display = "none";
  }

  document.querySelector("#controlPanel .contents .levelComplete").style.display = "block";

  document.querySelector("#kyberCrystalCollected").innerHTML = this.state.player.kyberCrystal;
  document.querySelector("#creditCollected").innerHTML = this.state.player.money;
  document.querySelector("#enemyKilled").innerHTML = this.state.player.enemyKilled;
  document.querySelector("#objectDestroyed").innerHTML = this.state.player.objectDestroyed;

  if (LevelManager.isGameEnd()) {
    document.querySelector("#nextLevelBtn").style.display = "none";
    document.querySelector("#gameEndBtn").style.display = "block";
    document.querySelector("#gameEndBtn").onclick = () => {
      this.state.gameEnd();
    };
  } else {
    document.querySelector("#gameEndBtn").style.display = "none";
    var nextLevelBtn = document.querySelector("#nextLevelBtn");
    nextLevelBtn.style.display = "block";
    nextLevelBtn.innerHTML = "<span>Start mission " + Util.add0(LevelManager.getLevelState().level) + "</span>";
    nextLevelBtn.onclick = () => {
      //this.state.restart();
      document.location.reload();
    };
  }
};

ControlPanel.prototype.toggle = function() {
  if (this.wrapper.style.display === "none") {
    this.show();
  } else {
    this.hide();
  }
};

ControlPanel.prototype.show = function() {
  this.engine.pause();
  this.wrapper.style.display = "block";

  if (this.state.ship.sounds.engine.isPlaying) {
    this.state.ship.sounds.engine.gain.gain.value = 0;
    this.state.ship.sounds.engine.pause();
  }

  this.state.sounds.play("click");
  this.updateView();
};

ControlPanel.prototype.hide = function() {
  this.engine.resume();
  this.wrapper.style.display = "none";
  this.state.sounds.play("click");
};

ControlPanel.prototype.updateView = function() {};

ControlPanel.prototype.reset = function() {
  document.getElementById("controlPanel").remove();
};

ControlPanel.prototype.showMsg = function(content) {
  var wrapper = document.createElement("div");
  wrapper.className = "messageBox";

  var wrapper1 = document.createElement("div");

  var footer = document.createElement("div");
  footer.className = "footer";

  var close = document.createElement("a");
  close.className = "close";
  wrapper.onclick = () => {
    document.body.removeChild(wrapper);
    this.state.sounds.play("click");
  };

  wrapper.appendChild(wrapper1);
  wrapper.appendChild(footer);

  wrapper1.appendChild(close);

  wrapper1.appendChild(content);

  document.body.appendChild(wrapper);

  wrapper.style.top = "30px";
  window.getComputedStyle(wrapper).top;
  wrapper.style.top = "100px";
};

ControlPanel.prototype.hideMsg = function() {
  var q = document.querySelector(".messageBox");
  if (q) {
    document.body.removeChild(q);
  }
};

ControlPanel.prototype.init = function() {
  var menu = document.querySelectorAll("#controlPanel .menu a");
  for (var i = 0, len = menu.length; i < len; i++) {
    menu[i].onclick = this.menuClick.bind(this);
  }

  var close = document.querySelector("#controlPanel .header .close");
  close.onclick = this.hide.bind(this);

  document.querySelector("#resetLevelState").onclick = function() {
    LevelManager.resetLevelState();
    document.location.reload();
  };

  var that = this;
  document.querySelector("#selfDestruct").onclick = function() {
    that.hide();
    setTimeout(() => {
      that.state.ship.die();
    }, 250);
  };

  var that = this;
  document.querySelector("#levelCompleteCheat").onclick = function() {
    that.hide();
    setTimeout(() => {
      for (var i = 0; i < that.state.missionController.kyberCrystalList.length; i++) {
        that.state.missionController.addKyberCrystal();
      }
    }, 250);
  };
};

ControlPanel.prototype.menuClick = function(e) {
  var contents = document.querySelectorAll("#controlPanel .contents .content");
  for (var i = 0, len = contents.length; i < len; i++) {
    contents[i].style.display = "none";
  }
  var menuItems = document.querySelectorAll("#controlPanel .menu a");
  for (i = 0, len = menuItems.length; i < len; i++) {
    menuItems[i].classList.remove("active");
  }

  var content = document.querySelectorAll("#controlPanel .contents ." + e.target.className)[0];
  content.style.display = "block";
  e.target.classList.add("active");

  this.state.sounds.play("click");
};

export default ControlPanel;
