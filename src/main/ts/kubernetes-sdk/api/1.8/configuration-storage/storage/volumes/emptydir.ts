import IVolume from "./ivolume";
import Volume from "./volume";
import VolumeMount from "../../../workloads/container/volumemount";

export default class EmptyDirVolume implements IVolume {
    private volume: Volume;

    constructor(name: string) {
        this.volume = new Volume(name);
    }

    toVolumeMount(mountPath: string): VolumeMount {
        return this.volume.toVolumeMount(mountPath);
    }

    toJson(): any {
        const json = this.volume.toJson();
        json.emptyDir = {};
        return json;
    }
}