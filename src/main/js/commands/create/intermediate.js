const FabricIntermediateRepresentationCreator = require('../../blockchains/fabric/configuration/intermediate/create');
const BurrowIntermediateRepresentationCreator = require('../../blockchains/burrow/configuration/intermediate/create');

const creators = [FabricIntermediateRepresentationCreator, BurrowIntermediateRepresentationCreator];

exports.command = 'intermediate-config <chain>';
exports.desc = 'Create intermediate configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    creators.forEach(Creator => {
        if (Creator.validCommandForChain(argv.chain)) {
            console.info('Creating intermediate configuration for %s', argv.chain);
            try {
                new Creator().create();
            }
            catch (e) {
                console.error(e);
            }
        }
    });
};