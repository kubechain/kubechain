import * as Path from 'path';
import X64 from '../architectures/x64';
import IPlatform from "./iplatform";
import Platform from './platform';

export default class Windows implements IPlatform {
    private platform: Platform;
    constructor() {
        this.platform = new Platform('win32');
    }

    equalsHostPlatform(): boolean {
        return this.platform.equalsHostPlatform();
    }

    getVirtualBoxSharedFolder() {
        return Path.posix.join(Path.posix.sep, 'c', 'Users');
    }

    name() {
        return 'windows';
    }

    isHostArchitectureSupported() {
        return new X64().equalsHostArchitecture();
    }
}