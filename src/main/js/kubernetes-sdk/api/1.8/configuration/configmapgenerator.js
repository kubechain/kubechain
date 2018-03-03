const path = require('path');
const Util = require('../../../../util');
const ConfigMap = require('./configmap');

class ConfigMapGenerator {
    static directoryTreeToConfigMaps(rootPath, namespace) {
        let map = {};
        Util.parseDirectoryTree(rootPath, rootPath, (nodePath) => {
            try {
                const nodePathRelativeToRootPath = path.relative(rootPath, nodePath) || path.basename(rootPath);
                const name = nodePathRelativeToRootPath.replace(new RegExp('\\' + path.sep, 'g'), '-');
                map[nodePathRelativeToRootPath] = new ConfigMap(path.basename(rootPath) + '-' + name, namespace, nodePath);
            }
            catch (error) {
                if (!(error.type) || (error.type && error.type !== "NO_FILES")) {
                    console.error(error.message);
                }
            }
        });
        return map;
    }

}

module.exports = ConfigMapGenerator;