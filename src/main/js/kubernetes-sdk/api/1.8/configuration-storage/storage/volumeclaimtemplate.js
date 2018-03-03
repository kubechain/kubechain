class VolumeClaimTemplate {
    constructor(name, spec) {
        this._name = name;
        this._spec = spec;
    }

    //TODO: Add super for Mountable volumes?
    toVolumeMount(mountPath) {
        return {
            "name": this._name,
            "mountPath": mountPath
        }
    }

    toJSON() {
        return {
            "metadata": {
                "name": this._name
            },
            "spec": this._spec
        }
    }
}

module.exports = VolumeClaimTemplate;