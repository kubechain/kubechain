import * as OS from "os";
import IPlatform from "./iplatform";

export default class UnsupportedPlatform implements IPlatform {
    equalsHostPlatform(): boolean {
        return false;
    }

    getVirtualBoxSharedFolder() {
        throw new Error(`Cannot get virtual-box shared folder for unsupported platform: ${OS.platform()}`);
    }

    name() {
        throw new Error(`Cannot get name for unsupported platform: ${OS.platform()}`);
    }

    isHostArchitectureSupported() {
        throw new Error(`Unsupported platform has no supported architectures: ${OS.platform()}`);
    }
}