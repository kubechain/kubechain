const IntermediateRepresentationDeleter = require('../../blockchains/fabric/configuration/intermediate/delete');

exports.command = 'intermediate-config <chain>';
exports.desc = 'Create intermediate configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    if (IntermediateRepresentationDeleter.validCommandForChain(argv.chain)) {
        console.info('Deleting intermediate configuration for %s', argv.chain);
        try {
            IntermediateRepresentationDeleter.delete();
        }
        catch (e) {
            console.error(e);
        }
    }
};