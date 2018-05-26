import FabricClusterDeleter from "../../../blockchains/fabric/kubernetes/cluster/delete";
import BurrowClusterDeleter from "../../../blockchains/burrow/kubernetes/cluster/delete";
import {createKubechainConfiguration} from "../../cli";

const deleters = [FabricClusterDeleter, BurrowClusterDeleter];

const command = 'cluster';
const desc = 'Delete Kubernetes-cluster for the specified target.';
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
    deleters.forEach(async (Deleter) => {
        try {
            const deleter = new Deleter();
            if (deleter.validCommandForChain(targets.blockchain)) {
                console.log('Deleting Kubernetes cluster for %s', targets.blockchain);
                await deleter.delete(kubechain);
            }
        }
        catch (e) {
            console.error("Unable to delete cluster for %s ", targets.blockchain);
            console.error("Reason:", e);
        }
    })
};

export {command, desc, builder, handler}