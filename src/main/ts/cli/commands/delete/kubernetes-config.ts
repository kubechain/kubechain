import FabricKubernetesConfigurationDeleter from "../../../blockchains/fabric/kubernetes/configuration/delete";
import BurrowKubernetesConfigurationDeleter from "../../../blockchains/burrow/kubernetes/configuration/delete";
import {argumentsToKubechainTargets} from "../../cli";

const deleters = [FabricKubernetesConfigurationDeleter, BurrowKubernetesConfigurationDeleter];
const command = 'kubernetes-config';
const desc = 'Delete Kubernetes configuration for the specified target.';
const builder = {
    'blockchain-target': {
        alias: 'b',
        describe: 'The blockchain target',
        demandOption: true
    },
    'kubernetes-target': {
        alias: 'k',
        describe: 'The Kubernetes target',
        demandOption: true
    }
};
const handler = function (argv: any) {
    const targets = argumentsToKubechainTargets(argv);
    deleters.forEach(Deleter => {
        const deleter = new Deleter();
        if (deleter.validCommandForChain(targets.blockchain.name)) {
            console.log('Deleting Kubernetes configuration for %s', targets.blockchain.name);
            deleter.delete(targets);
        }
    });
};

export {command, desc, builder, handler}