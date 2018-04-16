import FabricChainConfigurationDeleter from "../../../blockchains/fabric/blockchain/configuration/delete";
import BurrowChainConfigurationDeleter from "../../../blockchains/burrow/blockchain/configuration/delete";
import {argumentsToKubechainTargets} from "../../cli";

const deleters = [FabricChainConfigurationDeleter, BurrowChainConfigurationDeleter];

const command = 'chain-config <chain>';
const desc = 'Delete blockchain configuration for <chain>';
const builder = {};
const handler = function (argv: any) {
    const targets = argumentsToKubechainTargets(argv);
    deleters.forEach((Deleter) => {
        const deleter = new Deleter();
        if (deleter.validCommandForChain(targets.blockchain.name)) {
            console.log('Deleting chain configuration for %s', targets.blockchain.name);
            try {
                deleter.delete(targets)
            }
            catch (e) {
                console.error(e);
            }
        }
    })
};

export {command, desc, builder, handler}