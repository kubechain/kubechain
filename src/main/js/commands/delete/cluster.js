const FabricClusterDeleter = require('../../blockchains/fabric/cluster/delete');
const BurrowClusterDeleter = require('../../blockchains/burrow/cluster/delete');

const deleters = [FabricClusterDeleter, BurrowClusterDeleter];

exports.command = 'cluster <chain>';
exports.desc = 'Delete Kubernetes-cluster for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach(Deleter => {
        if (Deleter.validCommandForChain(argv.chain)) {
            console.log('Deleting Kubernetes cluster for %s', argv.chain);
            Deleter.delete();
        }
    })
};