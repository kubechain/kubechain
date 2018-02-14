const FabricKubernetesConfigurationCreator = require('../../blockchains/fabric/configuration/kubernetes/create');
const creators = [FabricKubernetesConfigurationCreator];

exports.command = 'kubernetes-config <chain>';
exports.desc = 'Create Kubernetes configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    creators.forEach(Creator => {
        if (Creator.validCommandForChain(argv.chain)) {
            console.log('Creating Kubernetes congiguration for %s', argv.chain);
            new Creator().create();
        }
    });
};