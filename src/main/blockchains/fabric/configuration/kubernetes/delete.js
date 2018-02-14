const fs = require('fs-extra');
const FabricCommandExecutor = require('../../command');
const FabricOptions = require('../../options');

class FabricKubernetesConfigurationDeleter extends FabricCommandExecutor {
    static delete() {
        const options = new FabricOptions();
        fs.removeSync(options.get('$.kubernetes.paths.root'));
    }
}

module.exports = FabricKubernetesConfigurationDeleter;