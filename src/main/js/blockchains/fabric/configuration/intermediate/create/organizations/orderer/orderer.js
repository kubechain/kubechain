const OrganizationEntity = require('../organizationentity');

class Orderer extends OrganizationEntity {
    constructor(name, path) {
        super(name, path, 'orderer')
    }
}

module.exports = Orderer;