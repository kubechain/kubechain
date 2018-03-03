const OS = require('os');

class Architecture {
    constructor(architecture) {
        this._architecture = architecture;
    }

    equalsHostArchitecture() {
        return this._architecture === OS.arch();
    }

    name() {
        return this._architecture;
    }
}

module.exports = Architecture;