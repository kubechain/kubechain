import X64 from './x64';
import Ppc64 from './ppc64';
import S390x from './s390x';
import UnsupportedArchitecture from './unsupported';
import IArchitecture from "./iarchitecture";

const supportedArchitectures = [new X64(), new Ppc64(), new S390x()];

function getHostArchitecture(): IArchitecture {
    for (let index = 0; index < supportedArchitectures.length; index++) {
        const architecture = supportedArchitectures[index];
        if (architecture.equalsHostArchitecture()) {
            return architecture;
        }
    }
    return new UnsupportedArchitecture();
}

export {getHostArchitecture}