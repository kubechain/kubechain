const Util = require('../../../util');

class Service {
    constructor(namespace, name) {
        this._namespace = namespace;
        this._name = name;
        this._selector = {};
        this._ports = [];
    }

    addPort(port) {
        this._ports.push(port);
    }

    addSelectorPair(key, value) {
        this._selector[key] = value;
    }

    toJSON() {
        return {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {
                "namespace": this._namespace,
                "name": this._name
            },
            "spec": {
                "selector": this._selector,
                "type": "NodePort",
                "ports": this._ports
            }
        }
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name + '-service', this.toJSON());
    }
}

module.exports = Service;