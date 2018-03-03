import IVolume from "./ivolume";
import VolumeMount from "../../../workloads/container/volumemount";

export default class Volume implements IVolume {
    private name: string;

    constructor(name: string) {
        this.name = name + '-volume';
    }


    toVolumeMount(mountPath: string): VolumeMount {
        return new VolumeMount(this.name, mountPath);
    }

    toJson(): any {
        return {
            "name": this.name
        };
    }
}