const Util = require('../../../../../util');
const Naming = require('../../../../utilities/naming');

class Service {
    constructor(namespace, name, type) {
        this._namespace = namespace;
        this._name = Naming.toDNS1123(name);
        this._type = type;
        this._selector = {};
        this._ports = [];
    }

    addPort(port) {
        this._ports.push(port);
    }

    addSelectorPair(key, value) {
        this._selector[key] = value;
    }

    domain() {
        return `${this._name}.${this._namespace}.svc.cluster.local`;
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
                "type": this._type,
                "ports": this._ports
            }
        }
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name + '-service', this.toJSON());
    }
}

module.exports = Service;