const FabricClusterCreator = require('../../../lib/blockchains/fabric/kubernetes/cluster/create').default;
const BurrowClusterCreator = require('../../../lib/blockchains/burrow/kubernetes/cluster/create').default;

const creators = [FabricClusterCreator, BurrowClusterCreator];

exports.command = 'cluster <chain>';
exports.desc = 'Create Kubernetes-cluster for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    creators.forEach(Creator => {
        const creator = new Creator();
        if (creator.validCommandForChain(argv.chain)) {
            console.log('Creating Kubernetes cluster for %s', argv.chain);
            creator.create();
        }
    })

};