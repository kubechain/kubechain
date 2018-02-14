const Architecture = require('./architecture');

class S390x extends Architecture {
    constructor() {
        super('s390x');
    }
}

module.exports = S390x;