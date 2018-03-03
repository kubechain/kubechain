const FabricUtil = require('./util');

class FilePaths {
    constructor() {
        this._filePaths = new Map();
    }

    addPemFile(key, path) {
        this.add(key, FabricUtil.findPemFileInDirectory(path));
    }

    addSkFile(key, path) {
        this.add(key, FabricUtil.findSkFileInDirectory(path));
    }

    add(key, path) {
        this._filePaths.set(key, path);
    }

    toJSON() {
        const json = {};
        this._filePaths.forEach((value, key) => {
            json[key] = value;
        });
        return json;
    }

}

module.exports = FilePaths;