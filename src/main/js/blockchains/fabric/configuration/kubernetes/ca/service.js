const Service = require('../../../../../kubernetes-sdk/api/1.8/discovery/services/service');

class CertificationAuthorityService {
    constructor(organizationName, nodePort) {
        this._service = new Service(organizationName, "ca");
        this._service.addSelectorPair("app", "hyperledger");
        this._service.addSelectorPair("role", "ca");
        this._service.addSelectorPair("org", organizationName);
        this._service.addSelectorPair("name", "ca");
        this._service.addPort({
            "name": "endpoint",
            "protocol": "TCP",
            "port": 7054,
            "targetPort": 7054
        })
    }

    toJSONFile(outputPath) {
        return this._service.toJSONFile(outputPath);
    }
}

module.exports = CertificationAuthorityService;