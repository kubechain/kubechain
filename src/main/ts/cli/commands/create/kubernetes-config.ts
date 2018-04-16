import FabricMinikubeAdapter from "../../../blockchains/fabric/adapters/minikube/adapter";
import FabricGceAdapter from "../../../blockchains/fabric/adapters/gce/adapter";
import BurrowMinikubeAdapter from "../../../blockchains/burrow/adapters/minikube/adapter";
import BurrowGceAdapter from "../../../blockchains/burrow/adapters/gce/adapter";
import {argumentsToKubechainTargets} from "../../cli";


const adapters = [FabricMinikubeAdapter, FabricGceAdapter, BurrowGceAdapter, BurrowMinikubeAdapter];

const command = 'kubernetes-config';
const desc = 'Create Kubernetes configuration for the specified target.';
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
    adapters.forEach(Adapter => {
        const adapter = new Adapter();
        if (adapter.matchesTargets(targets)) {
            console.log('Creating Kubernetes congiguration for %s', targets.blockchain.name);
            adapter.start();
        }
    })
}

export {command, desc, builder, handler}