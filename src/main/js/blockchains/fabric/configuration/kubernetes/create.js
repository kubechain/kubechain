const fs = require('fs');
const Path = require('path');

const FabricCommandExecutor = require('../../command');
const FabricOptions = require('../../options');
const Util = require('../../../../util');
const PeerOrganisation = require('./organizations/peer');
const OrdererOrganisation = require('./organizations/orderer');
const organizationTypes = [PeerOrganisation, OrdererOrganisation];

class FabricKubernetesConfigurationCreator extends FabricCommandExecutor {
    constructor() {
        super();
        this._options = new FabricOptions();
    }

    create() {
        console.info('[KUBERNETES CONFIGURATION]');
        Util.createDirectories(this._options.getAll('$.kubernetes.paths.*'));

        this._createOrganizations();
    }

    _createOrganizations() {
        const path = this._options.get('$.blockchain.paths.intermediate');
        fs.readdirSync(path).forEach(fileName => {
            let organizationJSON = undefined;
            try {
                organizationJSON = JSON.parse(fs.readFileSync(Path.join(path, fileName)));
            }
            catch (e) {
                console.error("Unable to parse JSON", e);
            }
            if (organizationJSON) {
                this._createOrganization(organizationJSON);
            }
        })
    }

    _createOrganization(organizationJSON) {
        const type = organizationJSON.type;
        organizationTypes.forEach(OrganizationType => {
            if (OrganizationType.equalsType(type)) {
                const organization = new OrganizationType(this._options, organizationJSON);
                organization.createKubernetesResources();
            }
        })
    }
}

module.exports = FabricKubernetesConfigurationCreator;