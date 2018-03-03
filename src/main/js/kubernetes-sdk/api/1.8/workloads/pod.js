const Util = require('../../../../util');

//TODO: Create interface for PodSpec. Move to Typescript.
class Pod {
    constructor(objectMeta, podSpec) {
        this._objectMeta = objectMeta;
        this._podSpec = podSpec;
    }

    toJSON() {
        return {
            "apiVersion": "v1",
            "kind": "Pod",
            "metadata": this._objectMeta,
            "spec": this._podSpec
        }
    }

    //TODO: Remove
    toJSONFile(outputPath, fileName) {
        Util.toJsonFile(outputPath, fileName, this.toJSON());
    }
}

module.exports = Pod;