const FabricClusterCreator = require('../../blockchains/fabric/cluster/create');

exports.command = 'cluster <chain>';
exports.desc = 'Create Kubernetes-cluster for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    if (FabricClusterCreator.validCommandForChain(argv.chain)) {
        console.log('Creating Kubernetes cluster for %s', argv.chain);
        FabricClusterCreator.create()
    }
};