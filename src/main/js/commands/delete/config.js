const FabricConfigurationgDeleter = require('../../../lib/blockchains/fabric/delete').default;
const BurrowConfigurationgDeleter = require('../../../lib/blockchains/burrow/delete').default;

const deleters = [FabricConfigurationgDeleter, BurrowConfigurationgDeleter];

exports.command = 'config <chain>';
exports.desc = 'Delete blockchain configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach(Deleter => {
        const deleter = new Deleter();
        if (deleter.validCommandForChain(argv.chain)) {
            console.log('Deleting all configuration  for %s', argv.chain);
            deleter.delete()
        }
    })

};