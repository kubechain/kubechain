const Kubechain = require('../../kubechain');
const FabricChainConfigurationCreator = require('../../blockchains/fabric/configuration/blockchain/create');

exports.command = 'chain-config <chain>';
exports.desc = 'Create blockchain configuration for <chain>';
exports.builder = {};
exports.handler = async function (argv) {
    if (FabricChainConfigurationCreator.validCommandForChain(argv.chain)) {
        console.log('Creating chain configuration for %s', argv.chain);
        try {
            const kubechain = new Kubechain();
            const creator = new FabricChainConfigurationCreator(kubechain);
            creator.create();
        }
        catch (e) {
            console.error(e);
        }
    }
};