const Path = require('path');
const MembershipServiceProvider = require('./membershipserviceprovider');

class EntityMembershipServiceProvider extends MembershipServiceProvider {
    constructor(name, path) {
        super(name, path);
        this._filePaths.addSkFile('privateKey', Path.join(path, 'keystore'));
        this._filePaths.addPemFile('signingCertificate', Path.join(path, 'signcerts'));
    }
}

module.exports = EntityMembershipServiceProvider;