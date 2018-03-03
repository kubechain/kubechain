const Path = require('path');
const SupportedPlatform = require('./supported');
const X64 = require('../architectures/x64');

//TODO: Fix this duplication by using a component.
class Windows extends SupportedPlatform {
    constructor() {
        super('win32');
    }

    getVirtualBoxSharedFolder() {
        return Path.posix.join(Path.posix.sep, 'c', 'Users');
    }

    name() {
        return 'windows';
    }

    isHostArchitectureSupported() {
        return new X64().equalsHostArchitecture();
    }
}

module.exports = Windows;