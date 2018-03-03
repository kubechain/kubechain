const fs = require('fs-extra');
const Path = require('path');
const CertificateAuthority = require('../certificateauthorities/certificateauthority');
const MembershipServiceProvider = require('../membershipserviceproviders/membershipserviceprovider');
const TlsCertificateAuthority = require('../certificateauthorities/tlscertificateauthority');
const AdminUser = require('./users/admin');
const RegularUser = require('./users/regular');

class Organization {
    constructor(name, path, type) {
        this._name = name;
        this._path = path;
        this._type = type;
        this._certificateAuthority = new CertificateAuthority(name, Path.join(path, 'ca'));
        this._membershipServiceProvider = new MembershipServiceProvider(name, Path.join(path, 'msp'));
        this._tlsCertificateAuthority = new TlsCertificateAuthority(name, Path.join(path, 'tlsca'));
        this._users = [];
        this._entities = [];
        this._addUsers();
    }

    _addUsers() {
        const usersPath = Path.join(this._path, 'users');
        fs.readdirSync(usersPath).forEach(userName => {
            const path = Path.join(usersPath, userName);
            let user = new RegularUser(userName, path);
            const match = userName.toLowerCase().match('admin');
            if (match && match.length > 0) {
                user = new AdminUser(userName, path);
            }
            this.addUser(user);
        });
    }

    addUser(user) {
        this._users.push(user);
    }

    addEntity(entity) {
        this._entities.push(entity);
    }

    toJSONFile(outputPath) {
        fs.outputFileSync(Path.join(outputPath, this._name + '.json'),
            JSON.stringify(this.toJSON(), null, 4));
    }

    toJSON() {
        return {
            "name": this._name,
            "type": this._type,
            "path": this._path,
            "certificateAuthority": this._certificateAuthority.toJSON(),
            "membershipServiceProvider": this._membershipServiceProvider.toJSON(),
            "tlsCertificateAuthority": this._tlsCertificateAuthority.toJSON(),
            "users": this._usersToJSON(),
            "entities": this._entitiesToJSON()
        }
    }

    _usersToJSON() {
        return this._users.map(user => {
            return user.toJSON();
        })
    }

    _entitiesToJSON() {
        return this._entities.map(entity => {
            return entity.toJSON()
        })
    }
}

module.exports = Organization;