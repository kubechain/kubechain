const Util = require('../../../../util');

// const Service = require('../discovery/services/service');

class StateFulSet {
    constructor(name, namespace, replicas) {
        this._name = name;
        this._namespace = namespace;
        this._serviceName = name;
        this._podManagementPolicy = "OrderedReady";
        this._labels = {};
        this._replicas = replicas || 1;
        this._initContainers = [];
        this._containers = [];
        this._volumeClaimTemplates = [];
        this._volumes = []
    }

    /**
     * @param {"Parallel"|"OrderedReady"} policy
     */
    setPodManagementPolicy(policy) {
        this._podManagementPolicy = policy;
    }

    addLabel(key, value) {
        this._labels[key] = value;
    }

    addInitContainer(container) {
        this._initContainers.push(container);
    }

    addContainer(container) {
        this._containers.push(container)
    }

    addVolume(volume) {
        this._volumes.push(volume);
    }

    addVolumeClaimTemplate(volumeClaimTemplate) {
        this._volumeClaimTemplates.push(volumeClaimTemplate);
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name, this.toJSON());
    }

    toJSON() {
        return {
            "apiVersion": "apps/v1beta2",
            "kind": "StatefulSet",
            "metadata": {
                "name": this._name,
                "namespace": this._namespace
            },
            "spec": {
                "podManagementPolicy": this._podManagementPolicy,
                "selector": {
                    "matchLabels": this._labels
                },
                "serviceName": this._name,
                "replicas": this._replicas,
                "template": {
                    "metadata": {
                        "labels": this._labels
                    },
                    "spec": {
                        "initContainers": this._initContainers,
                        "containers": this._containers,
                        "volumes": this._volumes
                    }
                },
                "volumeClaimTemplates": this._volumeClaimTemplates
            }
        }
    }


    /**
     * @param {Number} ordinal
     * @returns {string}
     */
    podHostName(ordinal) {
        if (this._allowedOrdinalRange(ordinal)) {
            return `${this._name}-${ordinal}`;
        }
        else {
            throw this._ordinalRangeError();
        }
    }

    _allowedOrdinalRange(ordinal) {
        return ordinal >= 0 && ordinal <= this._replicas
    }

    _ordinalRangeError() {
        return new RangeError(`Ordinal should be between 0 and ${this._replicas}.`);
    }

    podHostNames() {
        const hostNames = [];
        for (let ordinal = 0; ordinal < this._replicas; ordinal++) {
            hostNames.push(this.podHostName(ordinal));
        }
        return hostNames;
    }
}

module.exports = StateFulSet;