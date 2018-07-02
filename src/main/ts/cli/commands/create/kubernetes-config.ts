import FabricMinikubeAdapter from "../../../blockchains/fabric/adapters/minikube/adapter";
import FabricGceAdapter from "../../../blockchains/fabric/adapters/gce/adapter";
import BurrowMinikubeAdapter from "../../../blockchains/burrow/adapters/minikube/adapter";
import BurrowGceAdapter from "../../../blockchains/burrow/adapters/gce/adapter";
import {createKubechainConfiguration} from "../../cli";


const adapters = [FabricMinikubeAdapter, FabricGceAdapter, BurrowGceAdapter, BurrowMinikubeAdapter];

const command = 'kubernetes-config';
const desc = 'Create Kubernetes configuration for the specified target.';
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

function handler(argv: any) {
    (async () => {
        const kubechain = await createKubechainConfiguration(argv);
        const targets = kubechain.get('$.targets');
        adapters.forEach(Adapter => {
            const adapter = new Adapter(kubechain);
            if (adapter.matchesTargets(targets)) {
                console.log('Creating Kubernetes congiguration for %s', targets.blockchain.name);
                adapter.start();
            }
        })
    })();
}

export {command, desc, builder, handler}