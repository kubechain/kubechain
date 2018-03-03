const Service = require('./service');

class ClusterIP extends Service {
    constructor(name, namespace) {
        super(namespace, name, "ClusterIP");
    }

    setClusterIP(value) {
        this._clusterIP = value;
    }

    toJSON() {
        const json = super.toJSON();
        json.spec.clusterIP = this._clusterIP;
        return json;
    }
}

module.exports = ClusterIP;