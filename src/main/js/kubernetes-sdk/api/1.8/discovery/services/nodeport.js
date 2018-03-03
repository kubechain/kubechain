const Service = require('./service');

class NodePort extends Service {
    constructor(name, namespace) {
        super(name, namespace, "ClusterIP");
    }
}

module.exports = NodePort;