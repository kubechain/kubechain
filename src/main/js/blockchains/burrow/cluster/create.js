const CommandExecutor = require('../command');
const Options = require('../options');
const KubernetesResourceCreator = require('../../../kubernetes-sdk/utilities/resourcecreator');

class ClusterCreator extends CommandExecutor {
    static async create() {
        try {
            const options = new Options();
            console.info('[CREATING]');
            await new KubernetesResourceCreator(Options.name()).createResourcesFoundInDirectory(options.get('$.kubernetes.paths.root'));
            console.info('[SEEDS]');
            await new KubernetesResourceCreator(Options.name()).createResourcesFoundInDirectoryTree(options.get('$.kubernetes.paths.seeds'));
            console.info('[PEERS]');
            await new KubernetesResourceCreator(Options.name()).createResourcesFoundInDirectoryTree(options.get('$.kubernetes.paths.peers'));
        }
        catch (e) {
            console.error('Unable to create Burrow cluster.');
            console.error('Reason:', e);
        }
    }
}

module.exports = ClusterCreator;