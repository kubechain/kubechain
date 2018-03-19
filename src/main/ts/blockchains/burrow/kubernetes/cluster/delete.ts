import Options from "../../options";
import Kubechain from "../../../../kubechain";
import ICommandExecutor from "../../../utilities/icommandexecutor";
import KubernetesResourceDeleter from "../../../../kubernetes-sdk/utilities/resources/resourcedeleter";

export default class BurrowClusterDeleter implements ICommandExecutor {
    private options: Options;

    constructor() {
        this.options = new Options(new Kubechain());
    }

    validCommandForChain(chain: string): boolean {
        return chain === this.options.get('$.name');
    }

    async delete() {
        const deleter = new KubernetesResourceDeleter(this.options.get('$.name'));
        try {
            await deleter.deleteResourcesFoundInDirectoryTree(this.options.get('$.kubernetes.paths.root'));
        }
        catch (e) {
            console.error('Unable to delete Burrow cluster.');
            console.error('Reason:', e);
        }
    }
}