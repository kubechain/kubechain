import FabricChainConfigurationDeleter from "../../../blockchains/fabric/blockchain/configuration/delete";
import BurrowChainConfigurationDeleter from "../../../blockchains/burrow/blockchain/configuration/delete";
import {createKubechainConfiguration} from "../../cli";

const deleters = [FabricChainConfigurationDeleter, BurrowChainConfigurationDeleter];

const command = 'chain-config <chain>';
const desc = 'Delete blockchain configuration for <chain>';
const builder = {};
const handler = function (argv: any) {
    const kubechain = createKubechainConfiguration(argv);
    const targets = kubechain.get('$.targets');
    deleters.forEach((Deleter) => {
        const deleter = new Deleter();
        if (deleter.validCommandForChain(targets.blockchain)) {
            console.log('Deleting chain configuration for %s', targets.blockchain);
            try {
                deleter.delete(kubechain);
            }
            catch (e) {
                console.error(e);
            }
        }
    })
};

export {command, desc, builder, handler}