import IVolume from "../ivolume";
import Volume from "../volume";
import IHostPathVolumeSource from "../volumesources/hostpath/ihostpathvolumesource";
import VolumeMount from "../../../../workloads/container/volumemount";

export default class HostPathVolume implements IVolume, IHostPathVolumeSource {
    private volume: Volume;
    private volumeSource: IHostPathVolumeSource;

    constructor(name: string) {
        this.volume = new Volume(name);
    }

    setHostPathVolumeSource(volumeSource: IHostPathVolumeSource) {
        this.volumeSource = volumeSource;
    }

    setHostPath(hostPath: string): void {
        this.volumeSource.setHostPath(hostPath);
    }

    toVolumeMount(mountPath: string): VolumeMount {
        return this.volume.toVolumeMount(mountPath);
    }

    toJson(): any {
        const json = this.volume.toJson();
        json.hostPath = this.volumeSource.toJson();
        return json;
    }

}