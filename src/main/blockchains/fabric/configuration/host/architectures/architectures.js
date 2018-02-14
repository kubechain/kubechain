const X64 = require('./x64');
const Ppc64 = require('./ppc64');
const S390x = require('./s390x');
const UnsupportedArchitecture = require('./unsupported');

const supportedArchitectures = [new X64(), new Ppc64(), new S390x()];

function getHostArchitecture() {
    for (let index = 0; index < supportedArchitectures.length; index++) {
        const architecture = supportedArchitectures[index];
        if (architecture.equalsHostArchitecture()) {
            return architecture;
        }
    }
    return new UnsupportedArchitecture();
}

module.exports = {getHostArchitecture};