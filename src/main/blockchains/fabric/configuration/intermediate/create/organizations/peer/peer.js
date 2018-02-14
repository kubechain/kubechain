const OrganizationEntity = require('../organizationentity');

class Peer extends OrganizationEntity {
    constructor(name, path) {
        super(name, path, 'peer')
    }
}

module.exports = Peer;