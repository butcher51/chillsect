import CONFIG from "../../config";
import getCameraSize from "../../engine/getCameraSize";

var ShipConsole = function(state) {
  this.state = state;
  this.engine = state.engine;

  this.renderHtml();

  this.renderWeapons();
  this.renderSecondaryWeapons();
};

ShipConsole.prototype.constructor = ShipConsole;

ShipConsole.prototype.renderHtml = function() {
  var uiWrapper = document.createElement("div");
  uiWrapper.id = "uiWrapper";
  uiWrapper.className = "ui";
  uiWrapper.style.top = "-48px";

  var energyBar = document.createElement("div");
  energyBar.className = "energyBar";

  var weapons = document.createElement("div");
  var secondaryWeapons = document.createElement("div");
  weapons.className = "weapons";
  secondaryWeapons.className = "secondaryWeapons";

  var position = document.createElement("div");
  position.className = "position";
  uiWrapper.appendChild(position);
  this.position = position;

  uiWrapper.appendChild(energyBar);

  uiWrapper.appendChild(weapons);
  uiWrapper.appendChild(secondaryWeapons);

  var money = document.createElement("div");
  money.className = "money";
  money.innerText = "0";
  uiWrapper.appendChild(money);

  var kyberCrystal = document.createElement("div");
  kyberCrystal.className = "kyberCrystal";
  kyberCrystal.innerText =
    this.state.player.kyberCrystal +
    "/" +
    this.state.missionController.kyberCrystalList.length;
  uiWrapper.appendChild(kyberCrystal);

  var controlPanelBtn = document.createElement("a");
  controlPanelBtn.className = "controlPanelBtn";
  uiWrapper.appendChild(controlPanelBtn);

  var that = this;
  controlPanelBtn.onclick = function() {
    that.state.controlPanel.toggle();
  };

  var soundBtn = document.createElement("a");
  soundBtn.className =
    that.engine.sound === false ? "soundBtn disabled" : "soundBtn";
  uiWrapper.appendChild(soundBtn);

  soundBtn.onclick = function() {
    that.engine.sound = !that.engine.sound;
    soundBtn.className =
      that.engine.sound === false ? "soundBtn disabled" : "soundBtn";
  };

  this.money = money;
  this.energyBar = energyBar;
  this.weapons = weapons;
  this.secondaryWeapons = secondaryWeapons;
  this.kyberCrystal = kyberCrystal;

  this.weaponAmountCache = {
    weapons: [],
    secondaryWeapons: []
  };

  document.body.appendChild(uiWrapper);

  window.getComputedStyle(uiWrapper).top;
  uiWrapper.style.top = "0";

  this.tick = 0;

  this.resize();
};

ShipConsole.prototype.resize = function() {
  const cameraSize = getCameraSize();
  const restWidth = (window.innerWidth - cameraSize.width) / 2 + "px";
  this.kyberCrystal.style.left = restWidth;
  this.money.style.right = restWidth;
  window.tw.style.left = restWidth;
  const stat = document.querySelector("body > div:nth-child(4)");
  stat.style.right = restWidth;
};

ShipConsole.prototype.reset = function() {
  document.getElementById("uiWrapper").remove();
};

ShipConsole.prototype.updateKyberCrystal = function(val, max) {
  this.kyberCrystal.innerText = parseInt(val) + "/" + max;
};

ShipConsole.prototype.updateMoney = function(val) {
  this.money.innerText = parseInt(val);
};

ShipConsole.prototype.updateWeaponAmount = function(index, amount) {
  if (index === 0) return;
  this.weaponAmountCache["weapons"][index].innerHTML = amount;
};

ShipConsole.prototype.updateSecondaryWeaponAmount = function(index, amount) {
  this.weaponAmountCache["secondaryWeapons"][index].innerHTML = amount;
};

ShipConsole.prototype.renderWeapons = function(index) {
  this.renderWeaponsCommon(
    "weapons",
    (w, i) => {
      w.set(i);
    },
    index
  );
};

ShipConsole.prototype.renderSecondaryWeapons = function(index) {
  this.renderWeaponsCommon(
    "secondaryWeapons",
    (w, i) => {
      w.setSecondary(i);
    },
    index
  );
};

ShipConsole.prototype.renderWeaponsCommon = function(
  weaponType,
  clickCallback,
  index
) {
  this[weaponType].innerHTML = "";
  if (index) {
    for (
      var j = 0, al = this[weaponType].querySelectorAll("a"), jl = al.length;
      j < jl;
      j++
    ) {
      al[jl].classList.remove("active");
    }
  }

  for (
    var i = 0, w = this.state.weapons, l = w[weaponType].length;
    i < l;
    i++
  ) {
    var a = document.createElement("a");
    var span = document.createElement("span");
    if (i === index) {
      a.classList.add("active");
    }
    a.appendChild(span);

    if (i === 0 && weaponType === "weapons") {
      span.innerHTML = "";
    } else {
      this.weaponAmountCache[weaponType][i] = span;

      var amount = w[weaponType][i].amount;
      if (amount !== undefined) {
        span.innerHTML = w[weaponType][i].amount;
      }
    }

    ((w, i) => {
      a.onclick = e => {
        clickCallback(w, i);
      };
    })(w, i);

    this[weaponType].appendChild(a);
  }
};

ShipConsole.prototype.update = function(ship, force) {
  if (!force) {
    if (++this.tick > 30) {
      this.tick = 0;
    } else {
      return;
    }
  }

  this.energyBar.style.width =
    Math.max(
      2,
      Math.round(
        (ship.energy / CONFIG.ENERGY_MANAGEMENT.ENERGY_MAX_VALUE) * 622
      )
    ) + "px";
  this.energyBar.style.backgroundColor =
    ship.energy > CONFIG.ENERGY_MANAGEMENT.WARNING ? "#003cff" : "#dd2831";

  //
  //var x = Math.round(this.state.ship.body.position[0] / PROCEDURAL_BLOCK_SIZE);
  //var y = Math.round(this.state.ship.body.position[1] / PROCEDURAL_BLOCK_SIZE);

  // var px = Math.round(ship.body.position[0]/100);
  // var py = Math.round(ship.body.position[1]/100);
  //
  // if (px === this.lastPos[0] && py === this.lastPos[1]) {
  //     return;
  // }
  // this.lastPos = [px,py];
  //
  // this.position.innerText = 'x:' + parseInt(px) + ' y:' + parseInt(py);
};

export default ShipConsole;
