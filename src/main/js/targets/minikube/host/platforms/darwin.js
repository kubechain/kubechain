const Path = require('path');
const Platform = require('./platform');

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
}

module.exports = Darwin;