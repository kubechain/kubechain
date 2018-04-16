import FabricConfigurationDeleter from "../../../blockchains/fabric/delete";
import BurrowConfigurationDeleter from "../../../blockchains/burrow/delete";
import {argumentsToKubechainTargets} from "../../cli";

const deleters = [FabricConfigurationDeleter, BurrowConfigurationDeleter];


const command = 'config';
const desc = 'Delete all configuration for the specified target.';
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
            console.log('Deleting all configuration  for %s', targets.blockchain.name);
            deleter.delete(targets);
        }
    })
};

export {command, desc, builder, handler}