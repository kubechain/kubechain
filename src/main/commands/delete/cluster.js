const FabricClusterDeleter = require('../../blockchains/fabric/cluster/delete');

exports.command = 'cluster <chain>';
exports.desc = 'Delete Kubernetes-cluster for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    if (FabricClusterDeleter.validCommandForChain(argv.chain)) {
        console.log('Deleting Kubernetes cluster for %s', argv.chain);
        FabricClusterDeleter.delete();
    }
};