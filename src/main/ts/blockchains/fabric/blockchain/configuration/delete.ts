import * as fs from 'fs-extra';
import * as Path from 'path';
import ICommandExecutor from "../../../utilities/icommandexecutor";
import Options from '../../options';
import Kubechain from '../../../../kubechain';

export default class FabricChainConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    delete() {
        const options = new Options(new Kubechain());
        try {
            fs.removeSync(Path.join(options.get('$.blockchain.paths.root'), "genesis.block"));
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                console.error(e);
            }
        }
        fs.removeSync(options.get('$.blockchain.organizations.paths.*'));
    }
}