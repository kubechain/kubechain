const Path = require('path');
const fs = require('fs-extra');
const Util = require('../../../../util');
const ConfigurationStorage = require('./configurationstorage');
const SecretVolume = require('../configuration-storage/configuration/secretvolume');

class Secret extends ConfigurationStorage {
    constructor(name, namespace) {
        name += '-secret';
        super(new SecretVolume(name));
        this._name = name;
        this._namespace = namespace;
    }

    addFilesFromDirectory(path) {
        this._filePaths = Secret.verifyFilesExistIn(path);
        this._filesToDataPairs();
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

    addFileToData(path) {
        const key = this._renameDataKeyToPosix(Path.basename(path)); //TODO: Check actual name in Kubernetes spec. Doubt it's POSIX. Probably DNSsmth.
        const value = fs.readFileSync(path).toString('base64');
        this.addStringToData(key, value);
    }

    toJSON() {
        return {
            "apiVersion": "v1",
            "kind": "Secret",
            "metadata": {
                "name": this._name,
                "namespace": this._namespace
            },
            "type": "Opaque",
            "data": this._data
        }
    }

    toJSONFile(outputPath) {
        Util.toJsonFile(outputPath, this._name, this.toJSON());
    }
}


module.exports = Secret;