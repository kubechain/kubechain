const Util = require('../../../../util');

class PersistentVolume {
    constructor(name, spec) {
        this._name = name + '-persistent-volume';
        this._spec = spec;
    }

    toJSON() {
        return {
            "apiVersion": "v1",
            "kind": "PersistentVolume",
            "metadata": {
                "name": this._name
            },
            "spec": this._spec
        }
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name, this.toJSON());
    }
}

module.exports = PersistentVolume;