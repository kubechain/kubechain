import * as fs from 'fs-extra';
import Options from "../../options";
import ICommandExecutor from "../../../utilities/icommandexecutor";
import Kubechain from '../../../../kubechain';

export default class KubernetesConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    delete() {
        const options = new Options(new Kubechain());
        fs.removeSync(options.get('$.kubernetes.paths.root'));
    }
}