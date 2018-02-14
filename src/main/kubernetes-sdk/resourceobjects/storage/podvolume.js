const Util = require('../../../util');

class PodVolume {
    constructor(name, type) {
        this._name = name + '-volume';
        this._type = type;
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name, this.toJSON());
    }

    toJSON() {
        return {
            "name": this._name,
        };
    }

    toVolumeMount(mountPath) {
        return {
            "name": this._name,
            "mountPath": mountPath
        };
    }
}

module.exports = PodVolume;