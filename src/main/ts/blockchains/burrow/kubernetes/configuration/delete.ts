import * as fs from 'fs-extra';
import Options from "../../options";
import ICommandExecutor from "../../../utilities/icommandexecutor";
import Kubechain from "../../../../kubechain";
import KubechainTargets from "../../../../targets";

export default class KubernetesConfigurationDeleter implements ICommandExecutor {

    validCommandForChain(chain: string): boolean {
        return chain === 'burrow';
    }

    delete(targets: KubechainTargets) {
        const options = new Options(new Kubechain(targets));
        fs.removeSync(options.get('$.kubernetes.paths.root'));
    }
}