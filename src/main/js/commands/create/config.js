const FabricConfigurationCreator = require('../../../lib/blockchains/fabric/create').default;
const BurrowConfigurationCreator = require('../../../lib/blockchains/burrow/create').default;

const creators = [FabricConfigurationCreator, BurrowConfigurationCreator];

exports.command = 'config';
exports.desc = 'Create blockchain configuration for';
exports.builder = {
    'blockchain-target': {
        alias: 'b',
        describe: 'The blockchain target',
        demandOption: true
    },
    'kubernetes-target': {
        alias: 'k',
        describe: 'The Kubernetes target',
        demandOption: true
    }
};
exports.handler = function (argv) {
    creators.forEach(ConfigurationCreator => {
        const kubernetes = argv['kubernetes-target'];
        const blockchain = argv['blockchain-target'];
        const creator = new ConfigurationCreator(kubernetes);
        if (creator.matchesBlockchainTarget(blockchain) && creator.matchesKubernetesTarget(kubernetes)) {
            console.log('Creating configuration for %s', blockchain);
            creator.start();
        }
    })
};