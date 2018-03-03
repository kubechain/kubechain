const Path = require('path');
const Platform = require('./platform');

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
}

module.exports = Windows;