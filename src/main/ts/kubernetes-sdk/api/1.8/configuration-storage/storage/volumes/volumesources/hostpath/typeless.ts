import IHostPathVolumeSource from "./ihostpathvolumesource";
import HostPathVolumeSource from "./hostpathvolumesource";

export default class TypelessHostPathVolumeSource implements IHostPathVolumeSource {
    private hostPathVolumeSource: HostPathVolumeSource;

    constructor() {
        this.hostPathVolumeSource = new HostPathVolumeSource(undefined);
    }

    setHostPath(hostPath: string) {
        this.hostPathVolumeSource.setHostPath(hostPath);
    }

    toJson() {
        return this.hostPathVolumeSource.toJson();
    }
}