import FabricClusterCreator from "../../../blockchains/fabric/kubernetes/cluster/create";
import BurrowClusterCreator from "../../../blockchains/burrow/kubernetes/cluster/create";
import {createKubechainConfiguration} from "../../cli";
import ITargetsJson from "../../../kubechain/itargetsjson";

const creators = [FabricClusterCreator, BurrowClusterCreator];
const command = 'cluster';
const desc = 'Create Kubernetes-cluster for the specified target.';
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
        const targets: ITargetsJson = kubechain.get('$.targets');
        creators.forEach(async (Creator) => {
            const creator = new Creator();
            if (creator.validCommandForChain(targets.blockchain)) {
                console.log('Creating Kubernetes cluster for %s', targets.blockchain);
                await creator.create(kubechain);
            }
        })
    })();
}

export {command, desc, builder, handler}