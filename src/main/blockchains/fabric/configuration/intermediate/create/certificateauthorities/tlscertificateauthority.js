const FilePaths = require('../filepaths');

class TlsCertificateAuthority {
    constructor(name, path) {
        this._name = name;
        this._path = path;
        this._filePaths = new FilePaths();
        this._filePaths.addSkFile('privateKey', path);
        this._filePaths.addPemFile('certificate', path);
    }

    toJSON() {
        return {
            "name": this._name,
            "path": this._path,
            "filePaths": this._filePaths.toJSON()
        }
    }
}

module.exports = TlsCertificateAuthority;