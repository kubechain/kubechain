const BurrowMinikubeAdapter = require('../../../lib/blockchains/burrow/adapters/minikube/minikube').default;
const FabricMinikubeAdapter = require('../../../lib/blockchains/fabric/adapters/minikube/minikube').default;

const adapters = [BurrowMinikubeAdapter, FabricMinikubeAdapter];

exports.command = 'kubernetes-config';
exports.desc = 'Create Kubernetes configuration for a blockchain';
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
    adapters.forEach(Adapter => {
        const adapter = new Adapter();
        const blockchain = argv['blockchain-target'];
        if (adapter.matchesBlockchainTarget(blockchain) && adapter.matchesKubernetesTarget(argv['kubernetes-target'])) {
            console.log('Creating Kubernetes congiguration for %s', blockchain);
            adapter.start();
        }
    })
};