const fs = require('fs-extra');
const path = require('path');
const FabricCommandExecutor = require('../../command');
const FabricOptions = require('../../options');

class FabricChainConfigurationDeleter extends FabricCommandExecutor {
    static delete() {
        const options = new FabricOptions();
        try {
            fs.removeSync(path.join(options.get('$.blockchain.paths.root'), "genesis.block"));
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                console.error(e);
            }
        }
        fs.removeSync(options.get('$.blockchain.organizations.paths.*'));
    }
}

module.exports = FabricChainConfigurationDeleter;