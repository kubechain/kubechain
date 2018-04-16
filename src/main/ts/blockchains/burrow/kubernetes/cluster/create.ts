import Options from "../../options";
import Kubechain from "../../../../kubechain";
import KubernetesResourceCreator from '../../../../kubernetes-sdk/utilities/resources/resourcecreator';
import ICommandExecutor from "../../../utilities/icommandexecutor";
import KubechainTargets from "../../../../targets";
import {promptUserForDesiredContext} from "../../../utilities/cluster";

export default class ClusterCreator implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === "burrow";
    }

    async create(targets: KubechainTargets) {
        const options = new Options(new Kubechain(targets));

        try {
            console.info('[CREATING]');
            const context = await promptUserForDesiredContext();
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