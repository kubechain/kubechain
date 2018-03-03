const Platform = require('./platform');
const Path = require('path');

class Linux extends Platform {
    constructor() {
        super('linux');
    }

    getVirtualBoxSharedFolder() {
        return Path.posix.join(Path.posix.sep, 'hosthome');
    }

    name() {
        return 'linux';
    }
}

module.exports = Linux;