const IntermediateRepresentationCreator = require('../../blockchains/fabric/configuration/intermediate/create');

exports.command = 'intermediate-config <chain>';
exports.desc = 'Create intermediate configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    if (IntermediateRepresentationCreator.validCommandForChain(argv.chain)) {
        console.info('Creating intermediate configuration for %s', argv.chain);
        try {
            new IntermediateRepresentationCreator().create();
        }
        catch (e) {
            console.error(e);
        }
    }
};