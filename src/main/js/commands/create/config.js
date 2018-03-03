const FabricConfigurationCreator = require('../../blockchains/fabric/configuration/create');
const BurrowConfigurationCreator = require('../../blockchains/burrow/configuration/create');

const creators = [FabricConfigurationCreator, BurrowConfigurationCreator];

exports.command = 'config <chain>';
exports.desc = 'Create blockchain configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    creators.forEach(Creator => {
        if (Creator.validCommandForChain(argv.chain)) {
            console.log('Creating configuration for %s', argv.chain);
            Creator.create();
        }
    })
};