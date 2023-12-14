import { AdditiveBlending, Mesh, MeshBasicMaterial, Object3D } from 'three';
import Util from '../../util';
import LevelManager from '../../engine/levelmanager';
import { Game } from '../..';
import Main from '.';

export default class MissionController extends Object3D {
  controlFlags: any;
  kyberCrystalList: any[];

  constructor(private state: Main) {
    super();

    this.controlFlags = Game.engine.controls.getControlFlags();

    // this.mission = this.engine.loader.resources.level.data["mission"];

    var intMap = this.state.world.intMap;
    var shift = this.state.world.shift;
    var kyberCrystalList = [];

    // var tmp = [];

    for (var i = 0, ii, il = intMap.length / shift; i < il; i++) {
      ii = i * shift;
      if (intMap[ii + 3] === 3) {
        kyberCrystalList.push(ii);
        // tmp.push({
        //     index:ii,
        //     x:intMap[ii + 0],
        //     y:intMap[ii + 1],
        //     a2:intMap[ii + 2],
        //     a3:intMap[ii + 3],
        //     a4:intMap[ii + 4],
        //     a5:intMap[ii + 5],
        //     a6:intMap[ii + 6],
        //     a7:intMap[ii + 7],
        //     a8:intMap[ii + 8],
        //     a9:intMap[ii + 9]
        // });
      }
    }

    // window.kyberCrystal = tmp;

    this.kyberCrystalList = kyberCrystalList;

    var arrow = new Mesh(
      Game.engine.loader.resources['arrow'].geometry,
      new MeshBasicMaterial({
        color: 0x0044ff,
        transparent: true,
        opacity: 0.2,
        blending: AdditiveBlending
      })
    );
    arrow.scale.set(60, 60, 60);

    this.add(arrow);
  }

  public add(o) {
    super.add(o);
  }

  public complete = false;
  public inThePortal = false;

  public addKyberCrystal() {
    this.state.player.kyberCrystal++;

    this.state.console.updateKyberCrystal(this.state.player.kyberCrystal, this.kyberCrystalList.length);

    if (this.kyberCrystalList.length === this.state.player.kyberCrystal) {
      this.missionCompleted();
    }

    return this.state.player.kyberCrystal;
  }

  public missionCompleted() {
    console.log('complete!!');

    this.complete = true;

    LevelManager.increaseLevel();

    this.state.sounds.play('warning1');

    this.state.portal.open();
  }

  public update() {
    super.position.x = this.state.ship.position.x;
    super.position.y = this.state.ship.position.y;
    super.visible = !this.state.ship.dead;

    var xy = [super.position.x, super.position.y],
      f = [0, 0];

    if (this.inThePortal === true) {
    } else {
      if (this.complete === true) {
        var d = Math.sqrt(Util.dist2(f, xy));
        if (d < 200) {
          this.complete = false;
          this.inThePortal = true;
          super.visible = false;
          this.state.portal.in(this.state.ship);
        }
      } else {
        var kyberCrystalList = this.kyberCrystalList,
          intMap = this.state.world.intMap,
          r;

        for (var i = 0, d = 0, ii, k = [0, 0], dp = 1000000000, il = kyberCrystalList.length; i < il; i++) {
          ii = kyberCrystalList[i];
          k[0] = intMap[ii];
          k[1] = intMap[ii + 1];
          if (intMap[ii + 4] === -1) {
            continue;
          }
          d = Util.dist2(k, xy);
          if (d < dp) {
            f[0] = k[0];
            f[1] = k[1];
            dp = d;
          }
        }
      }

      r = Util.v2ToRad(f[0] - xy[0], f[1] - xy[1]);
      super.rotation.z = r;
    }
  }
}
