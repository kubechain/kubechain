import * as fs from 'fs-extra';
import Options from "../../options";
import ICommandExecutor from "../../../utilities/icommandexecutor";
import Kubechain from "../../../../kubechain";

export default class IntermediateConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'burrow';
    }

    delete() {
        const options = new Options(new Kubechain());
        fs.removeSync(options.get('$.blockchain.intermediate.paths.root'));
    }
}