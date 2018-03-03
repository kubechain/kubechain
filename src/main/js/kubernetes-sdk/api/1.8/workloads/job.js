const Util = require('../../../../util');

class Job {
    constructor(name, namespace) {
        this._name = name;
        this._namespace = namespace;
        this._initContainers = [];
        this._containers = [];
        this._volumes = [];
    }

    //TODO: Consider moving this into a Pod spec. Same functionality.
    addInitContainer(initContainer) {
        this._initContainers.push(initContainer);
    }

    addContainer(container) {
        this._containers.push(container);
    }

    addVolume(volume) {
        this._volumes.push(volume);
    }

    toJSON() {
        return {
            "apiVersion": "batch/v1",
            "kind": "Job",
            "metadata": {
                "name": this._name,
                "namespace": this._namespace
            },
            "spec": {
                //TODO: Make this an option.
                "backoffLimit": 1,
                "template": {
                    "spec": {
                        "restartPolicy": "Never",
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

module.exports = Job;