import * as OS from "os";
import IPlatform from "./iplatform";

export default class Platform implements IPlatform {
    private platform: string;

    constructor(platformNameInNodeJS: string) {
        this.platform = platformNameInNodeJS;
    }

    equalsHostPlatform() {
        return this.platform === OS.platform();
    }
}