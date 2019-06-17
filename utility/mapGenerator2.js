var alea = require('alea');
var fs = require('fs');

var level = 2;

var aleaGen = new alea(level+'');

var width = 30;
var height = 30;
var density = 400; // sürüség


var shift = 16;

var stat = {
    enemy0: 0,
    enemy1: 0,
    kyberCrystal: 0,
    asteroid: 0
};

console.log('Generate started:');

var getType = function (alea) {
    var scale = 4;

    var chance = 0.04;
    if (alea < scale * chance) {
        stat.enemy0++;
        return 1;
    }

    chance += 0.005;
    if (alea < scale * chance) {
        stat.enemy1++;
        return 2;
    }

    chance += 0.0025;
    if (alea < scale * chance) {
        stat.kyberCrystal++;
        return 3;
    }

    stat.asteroid++;
    return 0;//asteroid - default space object
};

var getHP = function (type, size) {
    switch (type) {
        case 1://enemy0
            return 15;
        case 2://enemy1
            return 60;
        case 3://kyberCrystal
            return 2500;
        default://asteroid - default space object
            return parseInt(size);
    }
};

var getSize = function (type, size) {
    switch (type) {
        case 1://enemy0
            return size;
        case 2://enemy1
            return size;
        case 3://kyberCrystal
            return 40;
        default://asteroid - default space object
            return size;
    }
};

var buffer = new ArrayBuffer(width * height * shift * 4);
var intMap = new Int32Array(buffer);
var floatMap = new Float32Array(buffer);
var i = 0;
//var base = 100000;

var halfParam1 = width * 800;// kezdő szétszorás
var type = 0, size = 0, hp = 0;

for (var x = 0, xl = width; x < xl; x++) {
    for (var y = 0, yl = height; y < yl; y++) {

        type = getType(aleaGen());
        size = getSize(type, 50 + aleaGen() * 200);
        hp = getHP(type, size);

        intMap[i] = -halfParam1;//x
        intMap[i + 1] = -halfParam1;//y
        intMap[i + 2] = 0;//visibleFlag
        intMap[i + 3] = type;//type
        intMap[i + 4] = hp;//hp
        intMap[i + 5] = size;  //size
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

        // console.log(i + ' - ' + intMap[i + 3]);

        i += shift;
    }
}

var halfSize = width * density;

var il = width * height;
var ax, ay, as, bx, by, bs, ii, jj, l1, l2;
for (i = 0; i < il; i++) {

    // if (i == 0) {
    //
    //     ii = i * shift;
    //     intMap[ii] = -500;//x
    //     intMap[ii + 1] = 500;//y
    //     intMap[ii + 3] = 6;//type - kyberCrystal
    //     intMap[ii + 4] = 2500;//hp
    //     intMap[ii + 5] = 40;//size
    //
    //     continue;
    // }
    // if (i == 1) {
    //
    //     ii = i * shift;
    //     intMap[ii] = 500;//x
    //     intMap[ii + 1] = 500;//y
    //     intMap[ii + 3] = 6;//type - kyberCrystal
    //     intMap[ii + 4] = 2500;//hp
    //     intMap[ii + 5] = 40;//size
    //
    //     continue;
    // }

    ii = i * shift;
    ax = intMap[ii] = -halfSize + aleaGen() * halfSize * 2;
    ay = intMap[ii + 1] = -halfSize + aleaGen() * halfSize * 2;
    as = intMap[ii + 5];

    for (var j = 0; j < i; j++) {

        jj = j * shift;
        bx = intMap[jj];
        by = intMap[jj + 1];
        bs = intMap[jj + 5];

        l1 = Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
        l2 = (as + bs);
        if (l1 < l2 || (
            ax > -1500 && ax < 1500 && ay > -1500 && ay < 1500
        )) {
            ax = intMap[ii] = -halfSize + aleaGen() * halfSize * 2;
            ay = intMap[ii + 1] = -halfSize + aleaGen() * halfSize * 2;
            j = -1;
        }

    }
}


console.log('Level: ', level);
console.log('Count: ', width * height);
console.log('Stat: ', stat);
console.log('Map half size: ', width * density);

function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

var wstream = fs.createWriteStream('assets/levels/' + level + '.dat');
wstream.write(toBuffer(buffer));
wstream.end();

