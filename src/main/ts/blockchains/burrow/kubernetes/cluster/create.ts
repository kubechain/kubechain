import Options from "../../options";
import Kubechain from "../../../../kubechain";
import KubernetesResourceCreator from '../../../../kubernetes-sdk/utilities/resources/resourcecreator';
import ICommandExecutor from "../../../utilities/icommandexecutor";

export default class ClusterCreator implements ICommandExecutor {
    private options: Options;

    constructor() {
        this.options = new Options(new Kubechain());
    }

    validCommandForChain(chain: string): boolean {
        return chain === this.options.get('$.name');
    }

    async create() {
        try {
            console.info('[CREATING]');
            await new KubernetesResourceCreator(this.options.get('$.name')).createResourcesFoundInDirectory(this.options.get('$.kubernetes.paths.root'));
            console.info('[SEEDS]');
            await new KubernetesResourceCreator(this.options.get('$.name')).createResourcesFoundInDirectoryTree(this.options.get('$.kubernetes.paths.seeds'));
            console.info('[PEERS]');
            await new KubernetesResourceCreator(this.options.get('$.name')).createResourcesFoundInDirectoryTree(this.options.get('$.kubernetes.paths.peers'));
        }
        catch (e) {
            console.error('Unable to create Burrow cluster.');
            console.error('Reason:', e);
        }
    }
}