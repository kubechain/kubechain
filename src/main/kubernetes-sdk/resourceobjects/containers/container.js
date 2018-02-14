class Container {
    constructor(name, image) {
        this._name = name;
        this._image = image;
        this._ports = [];
        this._volumeMounts = [];
        this._environment = []
    }

    addPort(port) {
        this._ports.push(port);
    }

    addVolumeMount(volumeMount) {
        this._volumeMounts.push(volumeMount);
    }

    addEnvironmentVariable(name, value) {
        this._environment.push({"name": name, "value": value});
    }

    toJSON() {
        return {
            "name": this._name,
            "image": this._image,
            "imagePullPolicy": "Always",
            "ports": this._ports,
            "env": this._environment,
            "volumeMounts": this._volumeMounts,
        }
    }
}

module.exports = Container;