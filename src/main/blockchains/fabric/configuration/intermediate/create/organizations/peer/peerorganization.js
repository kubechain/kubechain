const fs = require('fs-extra');
const Path = require('path');
const Organization = require('../organization');
const Peer = require('./peer');

class PeerOrganization extends Organization {
    constructor(name, path) {
        super(name, path, 'peer');
        this._addPeers();
    }

    _addPeers() {
        const orderersPath = Path.join(this._path, 'peers');
        fs.readdirSync(orderersPath).forEach(ordererName => {
            this.addEntity(new Peer(ordererName, Path.join(orderersPath, ordererName)));
        })
    }
}

module.exports = PeerOrganization;