const FabricConfigurationgDeleter = require('../../blockchains/fabric/configuration/delete');
const BurrowConfigurationgDeleter = require('../../blockchains/burrow/configuration/delete');

const deleters = [FabricConfigurationgDeleter, BurrowConfigurationgDeleter];

exports.command = 'config <chain>';
exports.desc = 'Delete blockchain configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach(Deleter => {
        if (Deleter.validCommandForChain(argv.chain)) {
            console.log('Deleting all configuration  for %s', argv.chain);
            Deleter.delete()
        }
    })

};