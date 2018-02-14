const Service = require('../../../../../kubernetes-sdk/resourceobjects/networking/service');

class OrdererService {
    constructor(ordererID, organizationName, nodePort) {
        this._service = new Service(organizationName, ordererID);
        this._service.addSelectorPair("app", "hyperledger");
        this._service.addSelectorPair("role", "orderer");
        this._service.addSelectorPair("orderer-id", ordererID);
        this._service.addSelectorPair("org", organizationName);
        this._service.addPort({
            "name": "listen-endpoint",
            "protocol": "TCP",
            "port": 7050,
            "targetPort": 7050,
            "nodePort": nodePort
        })
    }

    toJSONFile(outputPath) {
        return this._service.toJSONFile(outputPath);
    }
}

module.exports = OrdererService;