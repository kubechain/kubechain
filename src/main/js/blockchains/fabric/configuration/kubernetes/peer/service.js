const Service = require('../../../../../kubernetes-sdk/api/1.8/discovery/services/service');

class PeerService {
    constructor(organizationName, peerID) {
        this._service = new Service(organizationName, peerID);
        this._service.addSelectorPair("app", "hyperledger");
        this._service.addSelectorPair("role", "peer");
        this._service.addSelectorPair("peer-id", peerID);
        this._service.addSelectorPair("org", organizationName);
        this._service.addPort({
            "name": "externale-listen-endpoint",
            "protocol": "TCP",
            "port": 7051,
            "targetPort": 7051
        });
        this._service.addPort(
            {
                "name": "chaincode-listen",
                "protocol": "TCP",
                "port": 7052,
                "targetPort": 7052
            }
        );
        this._service.addPort({
            "name": "listen",
            "protocol": "TCP",
            "port": 7053,
            "targetPort": 7053
        });
    }

    toJSONFile(outputPath) {
        return this._service.toJSONFile(outputPath);
    }
}

module.exports = PeerService;