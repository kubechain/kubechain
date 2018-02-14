const Path = require('path');
const Platform = require('./platform');
const X64 = require('../architectures/x64');

class Windows extends Platform {
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