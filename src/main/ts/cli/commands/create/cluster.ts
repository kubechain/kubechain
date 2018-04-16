import FabricClusterCreator from "../../../blockchains/fabric/kubernetes/cluster/create";
import BurrowClusterCreator from "../../../blockchains/burrow/kubernetes/cluster/create";
import {argumentsToKubechainTargets} from "../../cli";

const creators = [FabricClusterCreator, BurrowClusterCreator];
const command = 'cluster';
const desc = 'Create Kubernetes-cluster for the specified target.';
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

function handler(argv: any) {
    const targets = argumentsToKubechainTargets(argv);
    creators.forEach(async (Creator) => {
        const creator = new Creator();
        if (creator.validCommandForChain(targets.blockchain.name)) {
            console.log('Creating Kubernetes cluster for %s', targets.blockchain.name);
            await creator.create(targets);
        }
    })
}

export {command, desc, builder, handler}