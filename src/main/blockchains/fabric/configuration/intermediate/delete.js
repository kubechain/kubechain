const fs = require('fs-extra');
const FabricCommandExecutor = require('../../command');
const FabricOptions = require('../../options');

class IntermediateRepresentationDeleter extends FabricCommandExecutor {
    static delete() {
        const options = new FabricOptions();
        fs.removeSync(options.get('$.blockchain.paths.intermediate'));
    }
}

module.exports = IntermediateRepresentationDeleter;