import { Vector3 } from 'three';
import { vec2 } from 'p2';

var version = '1.02.04';

class Util {
  public static circleLineIntersections(circle, line) {
    var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
    v1 = {};
    v2 = {};
    v1.x = line.p2.x - line.p1.x;
    v1.y = line.p2.y - line.p1.y;
    v2.x = line.p1.x - circle.center.x;
    v2.y = line.p1.y - circle.center.y;
    b = v1.x * v2.x + v1.y * v2.y;
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if (isNaN(d)) {
      // no intercept
      return [];
    }
    u1 = (b - d) / c; // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;
    retP1 = {}; // return points
    retP2 = {};
    ret = []; // return array
    if (u1 <= 1 && u1 >= 0) {
      // add point if on the line segment
      retP1.x = line.p1.x + v1.x * u1;
      retP1.y = line.p1.y + v1.y * u1;
      ret[0] = retP1;
    }
    if (u2 <= 1 && u2 >= 0) {
      // second add point if on the line segment
      retP2.x = line.p1.x + v1.x * u2;
      retP2.y = line.p1.y + v1.y * u2;
      ret[ret.length] = retP2;
    }
    return ret;
  }

  public static v2ToRad(dx, dy) {
    return Math.atan2(dy, dx);
  }

  public static radToAngle(rad) {
    rad *= 180 / Math.PI;
    return rad;
  }
  public static angleDiff(a1, a2) {
    return ((a1 - a2 + 180 + 360) % 360) - 180;
  }
  public static mergeObjects(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
      obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
      obj3[attrname] = obj2[attrname];
    }
    return obj3;
  }
  public static angleToRad(degrees) {
    return (degrees * Math.PI) / 180;
  }
  public static normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
      angle += 2 * Math.PI;
    }
    return angle;
  }
  public static lerpAngle(start, end, amount) {
    return start + (((((end - start) % 360) + 540) % 360) - 180) * amount;
  }
  public static vectorFromAngle(angle) {
    return [Math.cos(angle), Math.sin(angle)];
  }
  public static hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  public static Random = new (function () {
    var i = 200;
    var randoms = [];
    for (; i > 0; i--) {
      randoms.push(Math.random());
    }
    this.get = function () {
      return ++i >= randoms.length ? randoms[(i = 0)] : randoms[i];
    };
  })();

  public static sqr(x) {
    return x * x;
  }
  public static dist2(v, w) {
    return Util.sqr(v[0] - w[0]) + Util.sqr(v[1] - w[1]);
  }
  public static dist(v, w) {
    return Math.sqrt(Util.dist2(v, w));
  }
  public static pointInEllipse(x, y, rx, ry, h, k) {
    var xh = x - h;
    var yk = y - k;
    return (xh * xh) / (rx * rx) + (yk * yk) / (ry * ry) <= 1;
  }

  public static getAvoidPoint(p, v, w, s) {
    var l2 = Util.dist2(v, w);

    var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;

    var a = [p[0] - v[0], p[1] - v[1]];
    vec2.normalize(a, a);
    a[0] *= s;
    a[1] *= s;
    //p2.vec2.scale(a, a, s);
    var b;
    if (t < 0) {
      b = [p[0] - v[0], p[1] - v[1]];
      vec2.rotate(a, a, -Math.PI / 2);
    } else if (t > 1) {
      b = [p[0] - w[0], p[1] - w[1]];
      vec2.rotate(a, a, Math.PI / 2);
    } else {
      vec2.rotate(a, a, Math.PI / 2);
      b = [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])];
    }

    return [b[0] + a[0], b[1] + a[1]];
  }
  public static colorLerp(color1, color2, alpha) {
    color2.r += (color1.r - color2.r) * alpha;
    color2.g += (color1.g - color2.g) * alpha;
    color2.b += (color1.b - color2.b) * alpha;

    return color2;
  }
  public static distToSegmentSquared = function (p, v, w) {
    var l2 = Util.dist2(v, w);

    //if (l2 == 0) return dist2(p, v);
    // nálam soha nem lehet nulla

    var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;

    if (t < 0) return Util.dist2(p, v);
    if (t > 1) return Util.dist2(p, w);

    return Util.dist2(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]);
  };
  public static distToSegment = function (p, v, w) {
    return Math.sqrt(Util.distToSegmentSquared(p, v, w));
  };
  public static lookToCam = function (object) {
    object.rotateOnAxis(new Vector3(0, 0, 1), 45 * (Math.PI / 180));
    object.rotateOnAxis(new Vector3(1, 0, 0), 50 * (Math.PI / 180));
  };
  public static add0 = function (n) {
    return ('0' + n).slice(-2);
  };
}
