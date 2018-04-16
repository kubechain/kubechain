import FabricConfigurationCreator from "../../../blockchains/fabric/create";
import BurrowConfigurationCreator from "../../../blockchains/burrow/create";
import {argumentsToKubechainTargets} from "../../cli";

const creators = [FabricConfigurationCreator, BurrowConfigurationCreator];

const command = 'config';
const desc = 'Create blockchain configuration for the specified target.';
const builder = {
    'blockchain-target': {
        alias: 'b',
        describe: 'The blockchain target',
        demandOption: true
    },
    'kubernetes-target': {
        alias: 'k',
        describe: 'The Kubernetes target',
        demandOption: true
    }
};

function handler(argv: any) {
    const targets = argumentsToKubechainTargets(argv);
    creators.forEach(async (ConfigurationCreator) => {
        const creator = new ConfigurationCreator();
        if (creator.matchesTargets(targets)) {
            console.log('Creating configuration for %s', targets.blockchain.name);
            await creator.start(targets);
        }
    })
}

export {command, desc, builder, handler}