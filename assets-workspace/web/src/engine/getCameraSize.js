var getCameraSize = function() {
  var resolution = window.devicePixelRatio;
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (h / w < 0.5) {
    w = h / 0.5;
  }
  var w2 = Math.round(w * resolution);
  var h2 = Math.round(h * resolution);
  return {
    width: w2,
    height: h2
  };
};

export default getCameraSize;
