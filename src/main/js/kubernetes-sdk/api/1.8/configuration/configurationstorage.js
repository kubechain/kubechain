const fs = require('fs-extra');
const Path = require('path');
const KubernetesNaming = require('../../../utilities/naming');

class ConfigurationStorage {
    constructor(volume) {
        this._volume = volume;
        this._data = {};
        this._renamedDataKeys = [];
        this._containsRenamedDataKeys = false;
    }

    addFileToData(path) {
        const key = this._renameDataKeyToPosix(Path.basename(path)); //TODO: Check actual name in Kubernetes spec. Doubt it's POSIX. Probably DNSsmth.
        const value = fs.readFileSync(path).toString();
        this.addStringToData(key, value);
    }

    _renameDataKeyToPosix(key) {
        const posixKey = KubernetesNaming.fileNameToPosixFileName(key);
        if (key !== posixKey) {
            this._containsRenamedDataKeys = true;
        }
        this._renamedDataKeys.push({posixKey: posixKey, originalKey: key});

        return posixKey;
    }

    addStringToData(key, string) {
        this._data[key] = string;
    }


    toVolume() {
        this._checkRenamedDataKeys();
        return this._volume
    }

    /**
     * @desc If any Data Keys have been renamed to Posix add all keys as items.
     *       Kubernetes spec states: "If spec.volumes[].secret.items is used, only keys specified in items are projected.
     *       To consume all keys from the secret, all of them must be listed in the items field.
     *       All listed keys must exist in the corresponding secret. Otherwise, the volume is not created."
     * @private
     */
    _checkRenamedDataKeys() {
        if (this._containsRenamedDataKeys) {
            this._renamedDataKeys.forEach(key => {
                this._volume.addItem(key.posixKey, key.originalKey);
            })
        }
    }
}

module.exports = ConfigurationStorage;