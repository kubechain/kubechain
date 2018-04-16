const command = 'create <command>';
const desc = 'Create any of the following: Blockchain configuration, Kubernetes configuration, complete configuration, or a blockchain cluster for a specific blockchain.';
const builder = function (yargs: any) {
    return yargs.commandDir('create')
};

export {command, desc, builder}