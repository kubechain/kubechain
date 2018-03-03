const CommandExecutor = require('../command');
const KubernetesConfigurationDeleter = require('./kubernetes/delete');
const IntermediateConfigurationDeleter = require('./intermediate/delete');

class ConfigurationDeleter extends CommandExecutor {
    static delete() {
        KubernetesConfigurationDeleter.delete();
        IntermediateConfigurationDeleter.delete();
    }
}

module.exports = ConfigurationDeleter;