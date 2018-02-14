const Util = require('../../../util');

class Deployment {
    constructor(name, namespace, replicas) {
        this._name = name;
        this._namespace = namespace;
        this._replicas = replicas || 1;
        this._labels = {};
        this._initContainers = [];
        this._containers = [];
        this._volumes = [];
    }

    addLabel(key, value) {
        this._labels[key] = value;
    }

    //TODO: Consider moving this into a Pod spec. Same functionality.
    addInitContainer(container) {
        this._initContainers.push(container);
    }

    addContainer(container) {
        this._containers.push(container)
    }

    addVolume(volume) {
        this._volumes.push(volume);
    }

    toJSON() {
        return {
            "apiVersion": "apps/v1beta2",
            "kind": "Deployment",
            "metadata": {"namespace": this._namespace, "name": this._name},
            "spec": {
                "replicas": this._replicas,
                "strategy": {},
                "selector": {
                    "matchLabels": this._labels
                },
                "template": {
                    "metadata": {
                        "labels": this._labels
                    },
                    "spec": {
                        "initContainers": this._initContainers,
                        "containers": this._containers,
                        "volumes": this._volumes
                    }
                }
            }
        }
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name, this.toJSON());
    }
}

module.exports = Deployment;
