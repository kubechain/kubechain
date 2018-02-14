const FabricCommandExecutor = require('../command');
const FabricChainConfigurationCreator = require('./blockchain/create');
const FabricIntermediateConfigurationCreator = require('./intermediate/create');
const FabricKubernetesConfigurationCreator = require('./kubernetes/create');
const Kubechain = require('../../../kubechain.js');

class FabricConfigurationCreator extends FabricCommandExecutor {
    static async create() {
        try {
            await new FabricChainConfigurationCreator(new Kubechain()).create();
            new FabricIntermediateConfigurationCreator().create();
            new FabricKubernetesConfigurationCreator().create();
        }
        catch (e) {
            console.error("Unable to create complete fabric configuration.");
        }
    }
}

module.exports = FabricConfigurationCreator;