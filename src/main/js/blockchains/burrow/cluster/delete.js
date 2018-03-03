const CommandExecutor = require('../command');
const Options = require('../options');
const KubernetesResourceDeleter = require('../../../kubernetes-sdk/utilities/resourcedeleter');

class BurrowClusterDeleter extends CommandExecutor {
    static async delete() {
        const options = new Options();
        const creator = new KubernetesResourceDeleter(Options.name());
        try {
            await creator.deleteResourcesFoundInDirectoryTree(options.get('$.kubernetes.paths.root'));
        }
        catch (e) {
            console.error('Unable to create Burrow cluster.');
            console.error('Reason:', e);
        }
    }
}

module.exports = BurrowClusterDeleter;