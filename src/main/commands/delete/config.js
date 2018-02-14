const FabricConfigurationgDeleter = require('../../blockchains/fabric/configuration/delete');

exports.command = 'config <chain>';
exports.desc = 'Delete blockchain configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    if (FabricConfigurationgDeleter.validCommandForChain(argv.chain)) {
        console.log('Deleting all configuration  for %s', argv.chain);
        FabricConfigurationgDeleter.delete()
    }
};