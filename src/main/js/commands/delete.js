module.exports.command = 'delete <command>';
module.exports.desc = 'Delete any of the following: Blockchain configuration, Kubernetes configuration, complete configuration, or a blockchain cluster for a specific blockchain.';
module.exports.builder = function (yargs) {
    return yargs.commandDir('delete')
};