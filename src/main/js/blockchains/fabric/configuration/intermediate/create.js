const fs = require('fs-extra');
const Path = require('path');
const OrdererOrganization = require('./create/organizations/orderer/ordererorganization');
const PeerOrganization = require('./create/organizations/peer/peerorganization');
const FabricCommandExecutor = require('../../command');
const FabricOptions = require('../../options');
const Kubechain = require('../../../../kubechain');

class IntermediateRepresentationCreator extends FabricCommandExecutor {
    constructor() {
        super();
        this._fabricOptions = new FabricOptions(new Kubechain());
    }

    create() {
        const basePath = this._fabricOptions.get('$.blockchain.organizations.paths.*');
        const ordererOrganizationsPath = Path.join(basePath, 'ordererOrganizations');
        this.createOrganizations(ordererOrganizationsPath, (name, path) => {
            this.createOrdererOrganization(name, path);
        });
        const peerOrganizationsPath = Path.join(basePath, 'peerOrganizations');
        this.createOrganizations(peerOrganizationsPath, (name, path) => {
            this.createPeerOrganization(name, path);
        });
    }

    createOrganizations(path, createFunction) {
        fs.readdirSync(path).forEach(organizationName => {
            createFunction(organizationName, Path.join(path, organizationName));
        });
    }

    createOrdererOrganization(name, path) {
        const ordererOrganization = new OrdererOrganization(name, path);
        ordererOrganization.toJSONFile(this._fabricOptions.get('$.blockchain.paths.intermediate'));
    }

    createPeerOrganization(name, path) {
        const peerOrganization = new PeerOrganization(name, path);
        peerOrganization.toJSONFile(this._fabricOptions.get('$.blockchain.paths.intermediate'));
    }
}

module.exports = IntermediateRepresentationCreator;