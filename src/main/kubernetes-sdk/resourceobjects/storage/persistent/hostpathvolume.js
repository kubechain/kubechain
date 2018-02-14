const PersistentVolume = require('./persistentvolume');

class PersistentHostPathVolume extends PersistentVolume {
    constructor(name, hostPath, capacity, storageClassName) {
        super(name + '-hostpath',
            {
                "capacity": {
                    "storage": capacity
                },
                "accessModes": ["ReadWriteOnce"],
                "storageClassName": storageClassName,
                "hostPath": {
                    "path": hostPath,
                    //TODO: Create types for HostpathVolumes.
                    "type": "DirectoryOrCreate"
                }
            });
    }
}

module.exports = PersistentHostPathVolume;