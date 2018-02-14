module.exports.command = 'create <command>';
module.exports.desc = 'Create any of the following: blockchain configuration, Kubernetes configuration, complete configuration, or a blockchain cluster for a specific blockchain.';
module.exports.builder = function (yargs) {
    return yargs.commandDir('create')
};