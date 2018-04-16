import FabricChainConfigurationCreator from "../../../blockchains/fabric/blockchain/configuration/create";
import BurrowChainConfigurationCreator from "../../../blockchains/burrow/blockchain/configuration/create";
import {argumentsToKubechainTargets} from "../../cli";

const creators = [FabricChainConfigurationCreator, BurrowChainConfigurationCreator];

const command = 'chain-config <chain>';
const desc = 'Create blockchain configuration for <chain>';
const builder = {};

function handler(argv: any) {
    const targets = argumentsToKubechainTargets(argv);
    creators.forEach(async (Creator) => {
        const creator = new Creator();
        if (creator.validCommandForChain(targets.blockchain.name)) {
            console.log('Creating chain configuration for %s', targets.blockchain.name);
            try {
                await creator.create(targets);
            }
            catch (e) {
                console.error(e);
            }
        }
    });
}

export {command, desc, builder, handler}
