const Windows = require('./windows');
const Linux = require('./linux');
const Darwin = require('./darwin');
const UnsupportedPlatform = require('./unsupported');

const supportedPlatforms = [new Windows(), new Darwin(), new Linux()];

function getHostPlatform() {
    for (let index = 0; index < supportedPlatforms.length; index++) {
        const platform = supportedPlatforms[index];
        if (platform.equalsHostPlatform()) {
            return platform;
        }
    }
    return new UnsupportedPlatform();
}

module.exports = {getHostPlatform};