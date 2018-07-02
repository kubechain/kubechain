import Options from "../../options";
import Kubechain from "../../../../kubechain/kubechain";
import ICommandExecutor from "../../../utilities/icommandexecutor";
import KubernetesResourceDeleter from "../../../../kubernetes-sdk/utilities/resources/resourcedeleter";

export default class ClusterDeleter implements ICommandExecutor {

    validCommandForChain(chain: string): boolean {
        return chain === "burrow";
    }

    async delete(kubechain: Kubechain) {
        const options = new Options(kubechain);
        const context = options.get('$.kubernetes.context');
        const deleter = new KubernetesResourceDeleter(options.get('$.name'), context);
        try {
            await deleter.deleteResourcesFoundInDirectoryTree(options.get('$.kubernetes.paths.root'));
        }
        catch (e) {
            console.error('Unable to delete Burrow cluster.');
            console.error('Reason:', e);
        }
    }
}