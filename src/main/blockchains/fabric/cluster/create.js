const fs = require('fs');
const path = require('path');
const FabricCommandExecutor = require('../command');
const KubernetesResourceCreator = require('../../../kubernetes-sdk/utilities/resourcecreator');
const FabricOptions = require('../options');

class FabricClusterCreator extends FabricCommandExecutor {
    static async create() {
        try {
            const options = new FabricOptions();
            console.info('[CREATING]');
            await FabricClusterCreator._launchOrdererOrganizations(options);
            await FabricClusterCreator._launchPeerOrganizations(options);
        }
        catch (e) {
            console.error("Unable to create cluster.");
            console.error(e);
        }
    }

    static async _launchOrdererOrganizations(options) {
        console.info('[ORDERER-ORGANISATIONS]');
        return FabricClusterCreator._createOrganizations(options.get('$.kubernetes.paths.ordererorganizations'));
    }

    static async _launchPeerOrganizations(options) {
        console.info('[PEER-ORGANISATIONS]');
        return FabricClusterCreator._createOrganizations(options.get('$.kubernetes.paths.peerorganizations'));
    }

    static async _createOrganizations(basePath) {
        const organizationPaths = fs.readdirSync(basePath);
        for (let index = 0; index < organizationPaths.length; index++) {
            const organizationName = organizationPaths[index];
            console.info('[ORGANIZATION] -', organizationName);
            await FabricClusterCreator._createOrganization(basePath, organizationName);
        }
        return Promise.resolve();
    }

    static _createOrganization(basePath, name) {
        const organizationPath = path.join(basePath, name);
        const creator = new KubernetesResourceCreator(name);
        creator.doNotCreateKind("Job");
        return creator.createResourcesFoundInDirectoryTree(organizationPath);
    }
}

module.exports = FabricClusterCreator;