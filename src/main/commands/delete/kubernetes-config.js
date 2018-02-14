const FabricKubernetesConfigurationDeleter = require('../../blockchains/fabric/configuration/kubernetes/delete');

const deleters = [FabricKubernetesConfigurationDeleter];

exports.command = 'kubernetes-config <chain>';
exports.desc = 'Delete Kubernetes configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach(deleter => {
        if (deleter.validCommandForChain(argv.chain)) {
            console.log('Deleting Kubernetes congiguration for %s', argv.chain);
            deleter.delete();
        }
    });
};