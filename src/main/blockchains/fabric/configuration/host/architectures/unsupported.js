const Architecture = require('./architecture');

class Unsupported extends Architecture {
    constructor() {
        super('unsupported');
    }
}

module.exports = Unsupported;