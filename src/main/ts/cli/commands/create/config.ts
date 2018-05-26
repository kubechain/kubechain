import FabricConfigurationCreator from "../../../blockchains/fabric/create";
import BurrowConfigurationCreator from "../../../blockchains/burrow/create";
import {createKubechainConfiguration} from "../../cli";

const creators = [FabricConfigurationCreator, BurrowConfigurationCreator];

const command = 'config';
const desc = 'Create blockchain configuration for the specified target.';
const builder = {
    'blockchain-target': {
        alias: 'b',
        describe: 'The blockchain target',
        demandOption: false
    },
    'kubernetes-target': {
        alias: 'k',
        describe: 'The Kubernetes target',
        demandOption: false
    }
};

function handler(argv: any) {
    const kubechain = createKubechainConfiguration(argv);
    const targets = kubechain.get('$.targets');
    creators.forEach(async (ConfigurationCreator) => {
        const creator = new ConfigurationCreator(kubechain);
        if (creator.matchesTargets(targets)) {
            console.log('Creating configuration for %s', targets.blockchain);
            await creator.start(kubechain);
        }
    })
}

export {command, desc, builder, handler}