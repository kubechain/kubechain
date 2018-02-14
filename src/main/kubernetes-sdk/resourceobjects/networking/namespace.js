const Util = require('../../../util');

class Namespace {
    constructor(name) {
        this._name = name;
    }

    toJSON() {
        return {
            "apiVersion": "v1",
            "kind": "Namespace",
            "metadata":
                {"name": this._name}
        }
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name + '-namespace', this.toJSON());
    }
}

module.exports = Namespace;