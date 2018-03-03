const fs = require('fs-extra');
const Path = require('path');
const Organization = require('../organization');
const Orderer = require('./orderer');

class OrdererOrganization extends Organization {
    constructor(name, path) {
        super(name, path, 'orderer');
        this._addOrderers();
    }

    _addOrderers() {
        const orderersPath = Path.join(this._path, 'orderers');
        fs.readdirSync(orderersPath).forEach(ordererName => {
            this.addEntity(new Orderer(ordererName, Path.join(orderersPath, ordererName)))
        })
    }
}

module.exports = OrdererOrganization;