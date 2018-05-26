import * as fs from 'fs-extra';
import * as Path from 'path';
import ICommandExecutor from "../../../utilities/icommandexecutor";
import Options from '../../options';
import Kubechain from '../../../../kubechain/kubechain';

export default class ChainConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    delete(kubechain: Kubechain) {
        const options = new Options(kubechain);
        try {
            fs.removeSync(Path.join(options.get('$.blockchain.paths.root'), "genesis.block"));
            fs.removeSync(options.get('$.blockchain.organizations.paths.*'));
            fs.removeSync(options.get('$.blockchain.paths.chaincodes'));
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                console.error(e);
            }
        }
    }
}