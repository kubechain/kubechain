const command = 'delete <command>';
const desc = 'Delete any of the following: Blockchain configuration, Kubernetes configuration, complete configuration, or a blockchain cluster for a specific blockchain.';
const builder = function (yargs: any) {
    return yargs.commandDir('delete')
};

export {command, desc, builder}