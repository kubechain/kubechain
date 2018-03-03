const Path = require('path');
const EntityMembershipServiceProvider = require('../membershipserviceproviders/entitymembershipserviceprovider');
const Tls = require('../certificateauthorities/tls');

class OrganizationEntity {
    constructor(name, path, type) {
        this._name = name;
        this._path = path;
        this._type = type;
        this._membershipServiceProvider = new EntityMembershipServiceProvider(name, Path.join(path, 'msp'));
        this._tls = new Tls(name, path);
    }

    toJSON() {
        return {
            "name": this._name,
            "path": this._path,
            "type": this._type,
            "membershipServiceProvider": this._membershipServiceProvider.toJSON(),
            "tls": this._tls.toJSON()
        }
    }
}

module.exports = OrganizationEntity;