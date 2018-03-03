const HostPathVolume = require('./hostpathvolume');

class DirectoryOrCreatePersistentHostPathVolume {
    constructor(objectMeta) {
        this._objectMeta = objectMeta;
    }

    setHostPath(path) {
        this._hostPath = path;
    }

    setStorageClassName(name) {
        this._storageClassName = name;
    }

    setCapacity(capacity) {
        this._capacity = capacity;
    }

    toJSON() {
        const hostPathVolume = new HostPathVolume(this._objectMeta, this._hostPath, this._capacity, this._storageClassName);
        let json = hostPathVolume.toJSON();
        json.spec.hostpath.type = "DirectoryOrCreate"
    }
}

module.exports = DirectoryOrCreatePersistentHostPathVolume;