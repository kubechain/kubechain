import Options from "../../options";
import Kubechain from "../../../../kubechain/kubechain";
import KubernetesResourceCreator from '../../../../kubernetes-sdk/utilities/resources/resourcecreator';
import ICommandExecutor from "../../../utilities/icommandexecutor";

export default class ClusterCreator implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === "burrow";
    }

    async create(kubechain: Kubechain) {
        const options = new Options(kubechain);

        try {
            console.info('[CREATING]');
            const context = options.get('$.kubernetes.context');
            console.info('[NETWORK]');
            await new KubernetesResourceCreator(options.get('$.name'), context).createResourcesFoundInDirectory(options.get('$.kubernetes.paths.root'));
            console.info('[SEEDS]');
            await new KubernetesResourceCreator(options.get('$.name'), context).createResourcesFoundInDirectoryTree(options.get('$.kubernetes.paths.seeds'));
            console.info('[PEERS]');
            await new KubernetesResourceCreator(options.get('$.name'), context).createResourcesFoundInDirectoryTree(options.get('$.kubernetes.paths.peers'));
        }
        catch (e) {
            console.error('Unable to create Burrow cluster.');
            console.error('Reason:', e);
        }
    }
}