const CommandExecutor = require('../command');
const IntermediateRepresentationCreator = require('./intermediate/create');
const KubernetesConfigurationCreator = require('./kubernetes/create');

class BurrowConfigurationCreator extends CommandExecutor {
    static create() {
        new IntermediateRepresentationCreator().create();
        new KubernetesConfigurationCreator().create();
    }
}

module.exports = BurrowConfigurationCreator;