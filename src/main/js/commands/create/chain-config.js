const FabricChainConfigurationCreator = require('../../../lib/blockchains/fabric/blockchain/configuration/create').default;
const BurrowChainConfigurationCreator = require('../../../lib/blockchains/burrow/blockchain/configuration/create').default;

const creators = [new FabricChainConfigurationCreator(), new BurrowChainConfigurationCreator()];

exports.command = 'chain-config <chain>';
exports.desc = 'Create blockchain configuration for <chain>';
exports.builder = {};
exports.handler = async function (argv) {
    creators.forEach((creator) => {
        if (creator.validCommandForChain(argv.chain)) {
            console.log('Creating chain configuration for %s', argv.chain);
            try {
                creator.create();
            }
            catch (e) {
                console.error(e);
            }
        }
    })
};