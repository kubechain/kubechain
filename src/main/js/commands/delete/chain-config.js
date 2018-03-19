const FabricChainConfigurationDeleter = require('../../../lib/blockchains/fabric/blockchain/configuration/delete').default;
const BurrowChainConfigurationDeleter = require('../../../lib/blockchains/burrow/blockchain/configuration/delete').default;

const deleters = [FabricChainConfigurationDeleter, BurrowChainConfigurationDeleter];

exports.command = 'chain-config <chain>';
exports.desc = 'Delete blockchain configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach((Deleter) => {
        const deleter = new Deleter();
        if (deleter.validCommandForChain(argv.chain)) {
            console.log('Deleting chain configuration for %s', argv.chain);
            try {
                deleter.delete()
            }
            catch (e) {
                console.error(e);
            }
        }
    })

};