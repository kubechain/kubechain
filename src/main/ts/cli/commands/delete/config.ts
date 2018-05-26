import FabricConfigurationDeleter from "../../../blockchains/fabric/delete";
import BurrowConfigurationDeleter from "../../../blockchains/burrow/delete";
import {createKubechainConfiguration} from "../../cli";

const deleters = [FabricConfigurationDeleter, BurrowConfigurationDeleter];


const command = 'config';
const desc = 'Delete all configuration for the specified target.';
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
            console.log('Deleting all configuration  for %s', targets.blockchain);
            deleter.delete(kubechain);
        }
    })
};

export {command, desc, builder, handler}