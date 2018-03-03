const FabricClusterCreator = require('../../blockchains/fabric/cluster/create');
const BurrowClusterCreator = require('../../blockchains/burrow/cluster/create');

const creators = [FabricClusterCreator, BurrowClusterCreator];

exports.command = 'cluster <chain>';
exports.desc = 'Create Kubernetes-cluster for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    creators.forEach(Creator => {
        if (Creator.validCommandForChain(argv.chain)) {
            console.log('Creating Kubernetes cluster for %s', argv.chain);
            Creator.create();
        }
    })
};