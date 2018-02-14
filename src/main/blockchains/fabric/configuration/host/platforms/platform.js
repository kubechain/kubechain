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

    isHostArchitectureSupported() {

    }
}

module.exports = Platform;