const CommandExecutor = require('../../command');
const Options = require('../../options');
const ConfigurationCreator = require('../../../../../lib/ts/blockchains/burrow/configuration/kubernetes/create').default;

class KubernetesConfigurationCreator extends CommandExecutor {
    constructor() {
        super();
        this._options = new Options();
    }

    create() {
        console.info('[KUBERNETES]');
        new ConfigurationCreator(this._options).create();
    }
}

module.exports = KubernetesConfigurationCreator;