const fs = require('fs');
const path = require('path');
const FabricCommandExecutor = require('../command');
const FabricOptions = require('../options');
const KubernetesResourceDeleter = require('../../../kubernetes-sdk/utilities/resourcedeleter');

class FabricClusterDeleter extends FabricCommandExecutor {
    static async delete() {
        try {
            const options = new FabricOptions();
            console.info('[REMOVING]');
            await FabricClusterDeleter._removeOrdererOrganizations(options);
            await FabricClusterDeleter._deletePeerOrganizations(options);
        }
        catch (e) {
            console.error("Unable to delete cluster.");
            console.error(e);
        }
    }

    static _removeOrdererOrganizations(options) {
        console.info('[ORDERER-ORGANISATIONS]');
        return FabricClusterDeleter._deleteOrganizations(options.get('$.kubernetes.paths.ordererorganizations'));
    }

    static async _deletePeerOrganizations(options) {
        console.info('[PEER-ORGANISATIONS]');
        return FabricClusterDeleter._deleteOrganizations(options.get('$.kubernetes.paths.peerorganizations'))
    }

    static async _deleteOrganizations(basePath) {
        const organizationPaths = fs.readdirSync(basePath);
        for (let index = 0; index < organizationPaths.length; index++) {
            const organizationName = organizationPaths[index];
            console.info('[ORGANIZATION] -', organizationName);
            await FabricClusterDeleter._deleteOrganization(basePath, organizationName);
        }
        return Promise.resolve();
    }

    static _deleteOrganization(basePath, name) {
        const organizationPath = path.join(basePath, name);
        const resourceDeleter = new KubernetesResourceDeleter(name);
        return resourceDeleter.deleteResourcesFoundInDirectoryTree(organizationPath);
    }
}

module.exports = FabricClusterDeleter;
