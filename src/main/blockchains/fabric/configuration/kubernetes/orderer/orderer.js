const OrdererDeployment = require('./deployment');
const OrdererService = require('./service');

class Orderer {
    constructor(options, organization, fabricOptions) {
        this._name = options.name;
        this._organization = organization;
        this._fabricOptions = fabricOptions;
        this._id = this._name.split(".")[0]; //TODO: Change this.
    }

    name() {
        return this._name;
    }

    id() {
        return this._id;
    }

    toKubernetesResource(outputPath) {
        new OrdererDeployment(this, this._organization, this._organization.name(), this._id, this._fabricOptions).toJSONFile(outputPath);
        new OrdererService(this._id, this._organization.name(), this.exposedPort()).toJSONFile(outputPath);
    }

    exposedPort() {
        const portStart = 32700;
        return portStart + this._portOffset();
    }

    _portOffset() {
        return parseInt(this.id().split("orderer")[1]); //TODO: Change this.
    }

}

module.exports = Orderer;