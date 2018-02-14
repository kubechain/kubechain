const Platform = require('./platform');
const Path = require('path');
const X64 = require('../architectures/x64');
const Ppc64 = require('../architectures/ppc64');
const S390x = require('../architectures/s390x');

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

    isHostArchitectureSupported() {
        const supportedArchitectures = [new X64(), new Ppc64(), new S390x()];
        for (let index = 0; index < supportedArchitectures.length; index++) {
            const architecture = supportedArchitectures[index];
            if (architecture.equalsHostArchitecture()) {
                return true;
            }
        }
        return false;
    }
}

module.exports = Linux;