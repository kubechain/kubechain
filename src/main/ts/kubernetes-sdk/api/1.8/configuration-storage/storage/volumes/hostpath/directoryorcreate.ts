import IVolume from "../ivolume";
import IHostPathVolumeSource from "../volumesources/hostpath/ihostpathvolumesource";
import HostPathVolume from "./hostpath";
import DirectoryOrCreateHostPathVolumeSource from "../volumesources/hostpath/directoryorcreate";
import VolumeMount from "../../../../workloads/container/volumemount";

export default class DirectoryOrCreateHostPathVolume implements IVolume, IHostPathVolumeSource {
    private volume: HostPathVolume;

    constructor(name: string) {
        this.volume = new HostPathVolume(name);
        this.volume.setHostPathVolumeSource(new DirectoryOrCreateHostPathVolumeSource());
    }

    setHostPath(hostPath: string): void {
        this.volume.setHostPath(hostPath);
    }

    toVolumeMount(mountPath: string): VolumeMount {
        return this.volume.toVolumeMount(mountPath);
    }

    toJson(): any {
        return this.volume.toJson();
    }

}