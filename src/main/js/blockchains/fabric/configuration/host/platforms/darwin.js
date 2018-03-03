const Path = require('path');
const SupportedPlatform = require('./supported');
const X64 = require('../architectures/x64');

class Darwin extends SupportedPlatform {
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