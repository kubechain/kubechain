import IHostPathVolumeSource from "./ihostpathvolumesource";

export default class HostPathVolumeSource implements IHostPathVolumeSource {
    private hostPath: string;
    private type: string;

    constructor(type: string) {
        this.type = type;
    }

    setHostPath(hostPath: string) {
        this.hostPath = hostPath;
    }

    toJson() {
        return {
            "path": this.hostPath,
            "type": this.type
        }
    }
}