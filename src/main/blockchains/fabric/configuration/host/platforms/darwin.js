const Path = require('path');
const Platform = require('./platform');
const X64 = require('../architectures/x64');

class Darwin extends Platform {
    constructor() {
        super('darwin');
    }

    getVirtualBoxSharedFolder() {
        return Path.posix.join(Path.posix.sep, 'Users');
    }

    name() {
        return 'darwin';
    }

    isHostArchitectureSupported() {
        return new X64().equalsHostArchitecture();
    }
}

module.exports = Darwin;