const FabricKubernetesConfigurationDeleter = require('../../../lib/blockchains/fabric/kubernetes/configuration/delete').default;
const BurrowKubernetesConfigurationDeleter = require('../../../lib/blockchains/burrow/kubernetes/configuration/delete').default;

const deleters = [FabricKubernetesConfigurationDeleter, BurrowKubernetesConfigurationDeleter];

exports.command = 'kubernetes-config <chain>';
exports.desc = 'Delete Kubernetes configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach(Deleter => {
        const deleter = new Deleter();
        if (deleter.validCommandForChain(argv.chain)) {
            console.log('Deleting Kubernetes configuration for %s', argv.chain);
            deleter.delete();
        }
    });
};