import FabricChainConfigurationCreator from "../../../blockchains/fabric/blockchain/configuration/create";
import BurrowChainConfigurationCreator from "../../../blockchains/burrow/blockchain/configuration/create";
import {createKubechainConfiguration} from "../../cli";

const creators = [FabricChainConfigurationCreator, BurrowChainConfigurationCreator];

const command = 'chain-config <chain>';
const desc = 'Create blockchain configuration for <chain>';
const builder = {};

function handler(argv: any) {
    (async () => {
        const kubechain = await createKubechainConfiguration(argv);
        const targets = kubechain.get('$.targets');
        creators.forEach(async (Creator) => {
            const creator = new Creator();
            if (creator.validCommandForChain(targets.blockchain)) {
                console.log('Creating chain configuration for %s', targets.blockchain);
                try {
                    await creator.create(kubechain);
                }
                catch (e) {
                    console.error(e);
                }
            }
        });
    })();
}

export {command, desc, builder, handler}
