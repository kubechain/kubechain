import Windows from './windows';
import Linux from './linux';
import Darwin from './darwin';
import UnsupportedPlatform from './unsupported';

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

export {getHostPlatform}