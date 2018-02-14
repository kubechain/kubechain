const User = require('./user');

class AdminUser extends User {
    constructor(name, path) {
        super(name, path, 'admin');
    }
}

module.exports = AdminUser;