import * as yargs from "yargs";
import KubechainTargets from "../kubechain/targets";
import Kubechain from "../kubechain/kubechain";

function cli() {
    yargs.commandDir('commands')
        .demandCommand()
        .help()
        .argv;
}

function argumentsToKubechainTargets(argv: any): KubechainTargets {
    const kubernetes = argv['kubernetes-target'];
    const blockchain = argv['blockchain-target'] || argv['chain'];

    return new KubechainTargets({
        blockchain: blockchain,
        kubernetes: kubernetes
    });
}

function createKubechainConfiguration(argv: any): Kubechain {
    let kubechain = new Kubechain(undefined);
    if (argvHasKubechainTargets(argv)) {
        kubechain = new Kubechain(argumentsToKubechainTargets(argv));
    }
    else {
        kubechain.loadOptionsFromFileSystem()
    }

    return kubechain;
}

function argvHasKubechainTargets(argv: any) {
    const kubernetes = argv['kubernetes-target'];
    const blockchain = argv['blockchain-target'] || argv['chain'];
    return kubernetes && blockchain;
}

export {cli, argumentsToKubechainTargets, createKubechainConfiguration};