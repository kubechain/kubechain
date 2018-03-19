import * as Path from 'path';
import IPlatform from "./iplatform";
import X64 from '../architectures/x64';
import Platform from './platform';

export default class Darwin implements IPlatform {
    private platform: Platform;

    constructor() {
        this.platform = new Platform('darwin');
    }

    equalsHostPlatform(): boolean {
        return this.platform.equalsHostPlatform();
    }

    getVirtualBoxSharedFolder() {
        return Path.posix.join(Path.posix.sep, 'Users');
    }

    name() {
        return 'darwin';
    }

    isHostArchitectureSupported() {
        return new X64().equalsHostArchitecture();
    }
}