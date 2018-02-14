const Architecture = require('./architecture');

class X64 extends Architecture {
    constructor() {
        super('x64');
    }

    name() {
        return 'amd64';
    }
}

module.exports = X64;