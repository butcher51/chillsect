var alea = require('alea');
var fs = require('fs');

var aleaGen = new alea('1');

var width = 10;
var height = 10;
var shift = 16;

var getType = function (alea) {
    if (alea < 0.090) {
        return 1;
    } else if (alea < 0.095) {
        return 2;
    } else {
        return 0;
    }
};

var buffer = new ArrayBuffer(width * height * shift * 4);
//var intMap = new Int32Array(buffer);
var floatMap = new Float32Array(buffer);
var i = 0;
//var base = 100000;

var spread = 6;
var halfParam1 = width * spread/2;// kezdő szétszorás

for (var x = 0, xl = width; x < xl; x++) {
    for (var y = 0, yl = height; y < yl; y++) {
        //floatMap[i] = -halfParam1;
        //floatMap[i + 1] = -halfParam1;
        floatMap[i] = (spread/2 + x * spread) - halfParam1;//x
        floatMap[i + 1] = (spread/2 + y * spread) - halfParam1;//y
        floatMap[i + 2] = 0;//visibleFlag
        if (x > -2 && x < 2 && y > -2 && y < 2) {
            floatMap[i + 3] = 0;//type
        } else {
            floatMap[i + 3] = getType(aleaGen());//type
        }
        floatMap[i + 4] = 0;//hp
        floatMap[i + 5] = 1 + aleaGen() * 4;  //size
        floatMap[i + 6] = aleaGen();
        floatMap[i + 7] = aleaGen();
        floatMap[i + 8] = aleaGen();
        floatMap[i + 9] = aleaGen();
        floatMap[i + 10] = aleaGen();
        floatMap[i + 11] = aleaGen();
        floatMap[i + 12] = aleaGen();
        floatMap[i + 13] = aleaGen();
        floatMap[i + 14] = aleaGen();
        floatMap[i + 15] = aleaGen();

        console.log(i,floatMap[i],floatMap[i+1]);
        i += shift;

    }
}

//var halfSize = width * 12;//sürüség
//
//var il = width * height;
//var ax, ay, as, bx, by, bs, ii, jj, l1, l2;
//for (i = 0; i < il; i++) {
//
//    ii = i * shift;
//    ax = floatMap[ii] = -halfSize + aleaGen() * halfSize * 2;
//    ay = floatMap[ii + 1] = -halfSize + aleaGen() * halfSize * 2;
//    as = floatMap[ii + 5];
//
//
//    for (var j = 0; j < i; j++) {
//
//        jj = j * shift;
//        bx = floatMap[jj];
//        by = floatMap[jj + 1];
//        bs = floatMap[jj + 5];
//
//        l1 = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
//        l2 = (as + bs);
//        if (l1 < l2) {
//            ax = floatMap[ii] = -halfSize + aleaGen() * halfSize * 2;
//            ay = floatMap[ii + 1] = -halfSize + aleaGen() * halfSize * 2;
//            j = -1;
//        }
//
//    }
//
//    console.log(i,ax,ay,floatMap[ii+ 5 ]);
//}

function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

var wstream = fs.createWriteStream('G:/__exiammea/Exiammea/Assets/levels/01.bytes');
wstream.write(toBuffer(buffer));
wstream.end();

