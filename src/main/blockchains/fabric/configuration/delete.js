const FabricCommandExecutor = require('../command');
const FabricKubernetesConfigurationDeleter = require('./kubernetes/delete');
const FabricIntermediateConfigurationDeleter = require('./intermediate/delete');
const FabricChainConfigurationDeleter = require('./blockchain/delete');

class FabricConfigurationDeleter extends FabricCommandExecutor {
    static delete() {
        try {
            FabricKubernetesConfigurationDeleter.delete();
            FabricIntermediateConfigurationDeleter.delete();
            FabricChainConfigurationDeleter.delete();
        }
        catch (e) {
            console.error("Unable to delete all fabric configuration.");
            console.error("Reason:", e);
        }
    }
}

module.exports = FabricConfigurationDeleter;