const Path = require('path');
const FilePaths = require('../filepaths');

//TODO: Create Certificate super/component
class Tls {
    constructor(name, path) {
        this._name = name;
        this._path = path;
        this._filePaths = new FilePaths();
        this._filePaths.add('certificateAuthorityCertificate', Path.join(path, 'ca.crt'));
        this._filePaths.add('serverCertificate', Path.join(path, 'server.crt'));
        this._filePaths.add('serverKey', Path.join(path, 'server.key'));
    }

    toJSON() {
        return {
            "name": this._name,
            "path": this._path,
            "filePaths": this._filePaths.toJSON()
        }
    }
}

module.exports = Tls;

