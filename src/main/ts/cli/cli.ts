import * as yargs from "yargs";
import KubechainTargets from "../targets";

function cli() {
    yargs.commandDir('commands')
        .demandCommand()
        .help()
        .argv;
}

function argumentsToKubechainTargets(argv: any): KubechainTargets {
    const kubernetes = argv['kubernetes-target'];
    const blockchain = argv['blockchain-target'] || argv['chain'];

    return {blockchain: {name: blockchain}, kubernetes: {name: kubernetes}};
}

export {cli, argumentsToKubechainTargets};