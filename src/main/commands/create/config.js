const FabricConfigurationCreator = require('../../blockchains/fabric/configuration/create');

exports.command = 'config <chain>';
exports.desc = 'Create blockchain configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    if (FabricConfigurationCreator.validCommandForChain(argv.chain)) {
        console.log('Creating configuration for %s', argv.chain);
        FabricConfigurationCreator.create();
    }
};