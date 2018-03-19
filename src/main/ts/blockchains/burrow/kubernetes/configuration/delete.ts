import * as fs from 'fs-extra';
import Options from "../../options";
import ICommandExecutor from "../../../utilities/icommandexecutor";
import Kubechain from "../../../../kubechain";

export default class KubernetesConfigurationDeleter implements ICommandExecutor {
    private options: Options;

    constructor() {
        this.options = new Options(new Kubechain());
    }

    validCommandForChain(chain: string): boolean {
        return chain === this.options.get('$.name');
    }

    delete() {
        fs.removeSync(this.options.get('$.kubernetes.paths.root'));
    }
}