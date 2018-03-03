function cli() {
    require('yargs').commandDir('commands')
        .demandCommand()
        .help()
        .argv;
}

module.exports = {cli};