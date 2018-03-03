const FabricIntermediateRepresentationDeleter = require('../../blockchains/fabric/configuration/intermediate/delete');
const BurrowIntermediateRepresentationDeleter = require('../../blockchains/burrow/configuration/intermediate/delete');

const deleters = [FabricIntermediateRepresentationDeleter, BurrowIntermediateRepresentationDeleter];

exports.command = 'intermediate-config <chain>';
exports.desc = 'Create intermediate configuration for <chain>';
exports.builder = {};
exports.handler = function (argv) {
    deleters.forEach(Deleter => {
        if (Deleter.validCommandForChain(argv.chain)) {
            console.info('Deleting intermediate configuration for %s', argv.chain);
            try {
                Deleter.delete();
            }
            catch (e) {
                console.error(e);
            }
        }
    })

};