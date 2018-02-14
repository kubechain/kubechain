const FabricChainConfigurationDeleter = require('../../blockchains/fabric/configuration/blockchain/delete');

exports.command = 'chain-config <chain>';
exports.desc = 'Delete blockchain configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    if (FabricChainConfigurationDeleter.validCommandForChain(argv.chain)) {
        console.log('Deleting chain configuration for %s', argv.chain);
        try {
            FabricChainConfigurationDeleter.delete()
        }
        catch (e) {
            console.error(e);
        }
    }
};