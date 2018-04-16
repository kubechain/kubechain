import FabricClusterDeleter from "../../../blockchains/fabric/kubernetes/cluster/delete";
import BurrowClusterDeleter from "../../../blockchains/burrow/kubernetes/cluster/delete";
import {argumentsToKubechainTargets} from "../../cli";

const deleters = [FabricClusterDeleter, BurrowClusterDeleter];

const command = 'cluster';
const desc = 'Delete Kubernetes-cluster for the specified target.';
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
    deleters.forEach(async (Deleter) => {
        try {
            const deleter = new Deleter();
            if (deleter.validCommandForChain(targets.blockchain.name)) {
                console.log('Deleting Kubernetes cluster for %s', targets.blockchain.name);
                await deleter.delete(targets);
            }
        }
        catch (e) {
            console.error("Unable to delete cluster for %s ", targets.blockchain.name);
            console.error("Reason:", e);
        }
    })
};

export {command, desc, builder, handler}