const KubernetesNaming = require('../../utilities/naming');
const Util = require('../../../util');

const ConfigurationStorage = require('./configurationstorage');
const ConfigMapVolume = require('../storage/configuration/configmapvolume');

class ConfigMap extends ConfigurationStorage {
    //TODO: Consider adding labels.
    constructor(name, namespace, sourcePath) {
        name = KubernetesNaming.stringToValidKubernetesName(name, namespace) + '-config';
        super(new ConfigMapVolume(name));
        this._name = name;
        this._namespace = namespace;

        if (sourcePath) {
            this._sourcePath = sourcePath;
            this._filePaths = ConfigMap.verifyFilesExistIn(sourcePath);
            this._filesToDataPairs();
        }
    }

    sourcePath() {
        return this._sourcePath;
    }

    static verifyFilesExistIn(directory) {
        const filesInDirectory = Util.findFilesInDirectory(directory);
        if (filesInDirectory.length === 0) {
            const error = new Error("Directory contains no files: " + directory);
            error.type = 'NO_FILES';
            throw error;
        }
        return filesInDirectory;
    }

    _filesToDataPairs() {
        this._filePaths.forEach(path => {
            this.addFileToData(path);
        });
    }

    toJSON() {
        return {
            "apiVersion": "v1",
            "kind": "ConfigMap",
            "metadata": {
                "name": this._name,
                "namespace": this._namespace
            },
            "data": this._data
        }
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name, this.toJSON());
    }
}

module.exports = ConfigMap;