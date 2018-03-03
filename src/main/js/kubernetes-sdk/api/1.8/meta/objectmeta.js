const Naming = require('../../../utilities/naming');

class ObjectMeta {
    constructor(name, namespace) {
        this._name = name;
        this._namespace = namespace;
        this._labels = {};
    }

    addLabel(key, value) {
        this._labels[key] = Naming.toDNS1123(value);
    }

    toJSON() {
        return {
            "name": this._name,
            "namespace": this._namespace,
            "labels": this._labels
        }
    }
}

module.exports = ObjectMeta;