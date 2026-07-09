import CONFIG from '../config.js';
import {AudioLoader,NearestFilter,LinearMipMapLinearFilter, BufferGeometryLoader, FileLoader, ImageLoader, ObjectLoader, Texture} from 'three';

class Loader {
    constructor(engine) {

        this.engine = engine;

        this.resources = {};
    }

    loadLevel(file, callback) {

        var this_ = this;

        var url = CONFIG.ASSETS_FOLDER + file;

        var fail = function (why) {
            // Surface the failure instead of hanging silently on a black screen:
            // if the level JSON never loads, the callback never fires and preload
            // stalls forever with no error. Make it visible.
            var msg = "Failed to load " + url + " — " + why;
            console.error(msg);
            var loader = document.getElementById("loader");
            if (loader) {
                loader.innerHTML = msg + "<br>Is the server serving the project root? (npm start)";
            }
        };

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', url, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState !== 4) {
                return;
            }
            if (xobj.status === 200 || xobj.status === 0 /* file:// */) {
                var json;
                try {
                    json = JSON.parse(xobj.responseText);
                } catch (e) {
                    fail("invalid JSON (" + e.message + ")");
                    return;
                }
                this_.resources['level'] = {"data": json, "src": url, "loaded": true};
                callback(json);
            } else {
                fail("HTTP " + xobj.status);
            }
        };
        xobj.onerror = function () {
            fail("network error");
        };
        xobj.send(null);
    }

    load(resources, loadedCallback) {

        this.loadedCallback = loadedCallback;

        this.sum = Object.keys(resources).length;
        this.complete = 2;

        this.loaderScene = new ObjectLoader();
        this.loaderBufferGeoJSON = new BufferGeometryLoader();
        this.loaderImage = new ImageLoader();
        this.loaderFile = new FileLoader();
        this.loaderAudio = new AudioLoader();
        this.loaderFile.setResponseType('arraybuffer');

        for (var key in resources) {
            if (resources.hasOwnProperty(key)) {
                var resource = {"src": resources[key]};
                this.resources[key] = {"src": resource};
                if (resource.src.indexOf("sounds/") > -1) {
                    (function (resource, key, this_) {
                        this_.loaderAudio.load(CONFIG.ASSETS_FOLDER + resource.src, function (buffer) {

                            resource.buffer = buffer;
                            resource.loaded = true;
                            this_.resources[key] = resource;
                            this_.logEvent(key + "..............OK");
                            this_.isLoaded();
                        });
                    })(resource, key, this);
                } else if (resource.src.indexOf(".dat") > -1) {
                    (function (resource, key, this_) {
                        this_.loaderFile.load(CONFIG.ASSETS_FOLDER + resource.src, function (data) {

                            resource.byteArray = data;
                            resource.loaded = true;
                            this_.resources[key] = resource;
                            this_.logEvent(key + "..............OK");
                            this_.isLoaded();
                        });
                    })(resource, key, this);
                } else if (resource.src.indexOf(".scene.json") > -1) {
                    (function (resource, key, this_) {
                        this_.loaderScene.load(CONFIG.ASSETS_FOLDER + resource.src, function (scene) {

                            var meshes = [];
                            for (var i = 0, l = scene.children.length; i < l; i++) {
                                meshes.push(scene.children[i]);
                            }

                            resource.scene = {
                                animations: scene.animations,
                                meshes: meshes
                            };
                            resource.loaded = true;
                            this_.resources[key] = resource;
                            this_.logEvent(key + "..............OK");
                            this_.isLoaded();
                        });
                    })(resource, key, this);
                } else if (resource.src.indexOf(".buffer.json") > -1) {
                    (function (resource, key, this_) {
                        this_.loaderBufferGeoJSON.load(CONFIG.ASSETS_FOLDER + resource.src, function (geometry) {

                            resource.geometry = geometry;
                            resource.loaded = true;
                            this_.resources[key] = resource;
                            this_.logEvent(key + "..............OK");
                            this_.isLoaded();
                        });
                    })(resource, key, this);
                } else if (resource.src.indexOf("images/") > -1 || resource.src.indexOf("textures/") > -1) {
                    (function (resource, key, this_) {
                        this_.loaderImage.load(CONFIG.ASSETS_FOLDER + resource.src, function (image) {

                            resource.texture = new Texture();
                            resource.texture.image = image;
                            // resource.texture.anisotropy = 1;
                            // resource.texture.magFilter = NearestFilter;
                            // resource.texture.minFilter = LinearMipMapLinearFilter;
                            resource.texture.needsUpdate = true;
                            resource.loaded = true;
                            this_.resources[key] = resource;
                            this_.logEvent(key + "..............OK");
                            this_.isLoaded();
                        });
                    })(resource, key, this);
                }
            }
        }
        return this;
    }

    logEvent(txt) {
        var loader = document.getElementById("loader");
        if (loader) {
            loader.innerHTML = "Loading asset... " + (this.complete) + "/" + this.sum;
        }
    }

    isLoaded() {

        this.complete++;

        for (var key in this.resources) {
            if (this.resources.hasOwnProperty(key)) {
                var resource = this.resources[key];
                if (!resource.loaded) {
                    return false;
                }
            }
        }
        if (this.loadedCallback) {
            this.loadedCallback.apply(this.engine);
        }
        return true;

    }

}

export default  Loader;