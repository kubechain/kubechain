const FabricKubernetesConfigurationDeleter = require('../../blockchains/fabric/configuration/kubernetes/delete');
const BurrowKubernetesConfigurationDeleter = require('../../blockchains/burrow/configuration/kubernetes/delete');

const deleters = [FabricKubernetesConfigurationDeleter, BurrowKubernetesConfigurationDeleter];

exports.command = 'kubernetes-config <chain>';
exports.desc = 'Delete Kubernetes configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach(Deleter => {
        if (Deleter.validCommandForChain(argv.chain)) {
            console.log('Deleting Kubernetes congiguration for %s', argv.chain);
            Deleter.delete();
        }
    });
};