const OS = require('os');

class Platform {
    constructor(platform) {
        this._platform = platform;
    }

    equalsHostPlatform() {
        return this._platform === OS.platform();
    }

    getVirtualBoxSharedFolder() {
    }

    name() {
    }
}

module.exports = Platform;