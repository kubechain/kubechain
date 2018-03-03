const fs = require('fs-extra');
const CommandExecutor = require('../../command');
const Options = require('../../options');

class KubernetesConfigurationDeleter extends CommandExecutor {
    static delete() {
        const options = new Options();
        fs.removeSync(options.get('$.kubernetes.paths.root'));
    }
}

module.exports = KubernetesConfigurationDeleter;