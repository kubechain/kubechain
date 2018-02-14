const PodVolume = require('./podvolume');

class PersistentVolumeClaim extends PodVolume {
    constructor(name, namespace, spec) {
        name = name + '-persistent';
        super(name);
        this._name += '-claim';
        this._namespace = namespace;
        this._spec = spec;
    }

    toJSON() {
        return {
            "apiVersion": "v1",
            "kind": "PersistentVolumeClaim",
            "metadata": {
                "namespace": this._namespace,
                "name": this._name
            },
            "spec": this._spec
        }
    }

    toVolume() {
        return Object.assign(super.toJSON(), {
            "persistentVolumeClaim": {
                "claimName": this._name
            }
        });
    }

    toVolumeMount(mountPath, subPath) {
        return Object.assign(
            super.toVolumeMount(mountPath),
            (subPath) ? {subPath: subPath} : undefined
        );
    }
}

module.exports = PersistentVolumeClaim;