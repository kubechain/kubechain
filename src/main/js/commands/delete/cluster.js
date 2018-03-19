const FabricClusterDeleter = require('../../../lib/blockchains/fabric/kubernetes/cluster/delete').default;
const BurrowClusterDeleter = require('../../../lib/blockchains/burrow/kubernetes/cluster/delete').default;

const deleters = [FabricClusterDeleter, BurrowClusterDeleter];

exports.command = 'cluster <chain>';
exports.desc = 'Delete Kubernetes-cluster for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach(Deleter => {
        try {
            const deleter = new Deleter();
            if (deleter.validCommandForChain(argv.chain)) {
                console.log('Deleting Kubernetes cluster for %s', argv.chain);
                deleter.delete();
            }
        }
        catch (e) {
            console.error("Unable to delete cluster for %s ", argv.chain);
            console.error("Reason:", e);
        }
    })
};