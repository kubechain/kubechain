import Options from "../../options";
import Kubechain from "../../../../kubechain";
import ICommandExecutor from "../../../utilities/icommandexecutor";
import KubernetesResourceDeleter from "../../../../kubernetes-sdk/utilities/resources/resourcedeleter";
import KubechainTargets from "../../../../targets";
import {promptUserForDesiredContext} from "../../../utilities/cluster";

export default class ClusterDeleter implements ICommandExecutor {

    validCommandForChain(chain: string): boolean {
        return chain === "burrow";
    }

    async delete(targets: KubechainTargets) {
        const options = new Options(new Kubechain(targets));
        const context = await promptUserForDesiredContext();
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