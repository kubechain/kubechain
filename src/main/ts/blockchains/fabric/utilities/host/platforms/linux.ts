import * as Path from "path";
import IPlatform from "./iplatform";
import Platform from "./platform";

import X64 from "../architectures/x64";
import Ppc64 from "../architectures/ppc64";
import S390x from "../architectures/s390x";
import IArchitecture from "../architectures/iarchitecture";

export default class Linux implements IPlatform {
    private platform: Platform;

    constructor() {
        this.platform = new Platform("linux")
    }

    equalsHostPlatform(): boolean {
        return this.platform.equalsHostPlatform();
    }

    getVirtualBoxSharedFolder() {
        return Path.posix.join(Path.posix.sep, "hosthome");
    }

    name() {
        return "linux";
    }

    isHostArchitectureSupported() {
        const supportedArchitectures: IArchitecture[] = [new X64(), new Ppc64(), new S390x()];
        for (let index = 0; index < supportedArchitectures.length; index++) {
            const architecture = supportedArchitectures[index];
            if (architecture.equalsHostArchitecture()) {
                return true;
            }
        }
        return false;
    }
}