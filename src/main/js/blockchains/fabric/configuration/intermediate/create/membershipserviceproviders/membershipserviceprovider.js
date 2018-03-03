const Path = require('path');
const FilePaths = require('../filepaths');

class MembershipServiceProvider {
    constructor(name, path) {
        this._name = name;
        this._path = path;
        this._filePaths = new FilePaths();
        this._filePaths.addPemFile('adminCertificate', Path.join(path, 'admincerts'));
        this._filePaths.addPemFile('certificateAuthorityCertificate', Path.join(path, 'cacerts'));
        this._filePaths.addPemFile('tlsCertificateAuthorityCertificate', Path.join(path, 'tlscacerts'));
    }

    toJSON() {
        return {
            "name": this._name,
            "path": this._path,
            "filePaths": this._filePaths.toJSON()
        }
    }
}

module.exports = MembershipServiceProvider;