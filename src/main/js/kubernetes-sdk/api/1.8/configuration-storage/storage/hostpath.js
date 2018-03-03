const PodVolume = require('./podvolume');

class HostPathVolume extends PodVolume {
    constructor(name, hostPath) {
        name += '-hostpath';
        super(name);
        this._hostPath = hostPath;
    }

    toJSON() {
        return Object.assign(super.toJSON(), {
            "hostPath": {
                "path": this._hostPath,
                "type": "DirectoryOrCreate"
            }
        });
    }
}

module.exports = HostPathVolume;