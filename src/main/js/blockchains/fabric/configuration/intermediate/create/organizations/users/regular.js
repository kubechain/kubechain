const User = require('./user');

class RegularUser extends User {
    constructor(name, path) {
        super(name, path, 'regular');
    }
}

module.exports = RegularUser;