const fs = require('fs-extra');
const CommandExecutor = require('../../command');
const Options = require('../../options');

class IntermediateConfigurationDeleter extends CommandExecutor {
    static delete() {
        const options = new Options();
        fs.removeSync(options.get('$.blockchain.intermediate.paths.root'));
    }
}

module.exports = IntermediateConfigurationDeleter;