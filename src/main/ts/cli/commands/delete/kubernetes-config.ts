import FabricKubernetesConfigurationDeleter from "../../../blockchains/fabric/kubernetes/configuration/delete";
import BurrowKubernetesConfigurationDeleter from "../../../blockchains/burrow/kubernetes/configuration/delete";
import {createKubechainConfiguration} from "../../cli";

const deleters = [FabricKubernetesConfigurationDeleter, BurrowKubernetesConfigurationDeleter];
const command = 'kubernetes-config';
const desc = 'Delete Kubernetes configuration for the specified target.';
const builder = {
    'blockchain-target': {
        alias: 'b',
        describe: 'The blockchain target',
        demandOption: false
    },
    'kubernetes-target': {
        alias: 'k',
        describe: 'The Kubernetes target',
        demandOption: false
    }
};
const handler = function (argv: any) {
    const kubechain = createKubechainConfiguration(argv);
    const targets = kubechain.get('$.targets');
    deleters.forEach(Deleter => {
        const deleter = new Deleter();
        if (deleter.validCommandForChain(targets.blockchain)) {
            console.log('Deleting Kubernetes configuration for %s', targets.blockchain);
            deleter.delete(kubechain);
        }
    });
};

export {command, desc, builder, handler}