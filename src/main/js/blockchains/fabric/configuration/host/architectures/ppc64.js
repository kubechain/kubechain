const Architecture = require('./architecture');

class Ppc64 extends Architecture {
    constructor() {
        super('ppc64');
    }

    name() {
        return 'ppc64le';
    }
}

module.exports = Ppc64;