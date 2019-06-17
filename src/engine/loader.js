import CONFIG from '../config';
import {AudioLoader,NearestFilter,LinearMipMapLinearFilter, BufferGeometryLoader, FileLoader, ImageLoader, ObjectLoader, Texture} from 'three';

var Loader = function (engine) {

    this.engine = engine;

    this.resources = {};

    this.loadLevel = function (file, callback) {

        var this_ = this;

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', CONFIG.ASSETS_FOLDER + file, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                var json = JSON.parse(xobj.responseText);
                this_.resources['level'] = {"data": json, "src": CONFIG.ASSETS_FOLDER + file, "loaded": true};
                callback(json);
            }
        };
        xobj.send(null);
    };

    this.load = function (resources, loadedCallback) {

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
    };

    this.logEvent = function (txt) {
        var loader = document.getElementById("loader");
        if (loader) {
            loader.innerHTML = "Loading asset... " + (this.complete) + "/" + this.sum;
        }
    };

    this.isLoaded = function () {

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

};

export default  Loader;