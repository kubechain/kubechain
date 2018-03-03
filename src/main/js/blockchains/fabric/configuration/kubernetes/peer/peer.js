const PeerDeployment = require('./deployment');
const PeerService = require('./service');

class Peer {
    constructor(options, organization) {
        this._name = options.name;
        this._organization = organization;
        this._id = this._name.split(".")[0];
    }

    name() {
        return this._name;
    }

    id() {
        return this._id;
    }

    toKubernetesResource(outputPath) {
        new PeerDeployment(this._organization, this, this._organization.name(), this._name).toJSONFile(outputPath);
        new PeerService(this._organization.name(), this._id).toJSONFile(outputPath);
    }

    exposedPort(number) {
        const portStart = 30000;
        return portStart + this._organization.addressSegment() + this._portOffset() + number;
    }

    _portOffset() {
        return parseInt((this.id().split("peer")[-1])) * 4;
    }

}

module.exports = Peer;