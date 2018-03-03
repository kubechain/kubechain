import IVolume from "./ivolume";
import Volume from "./volume";
import VolumeMount from "../../../workloads/container/volumemount";

export default class PersistentVolumeClaimVolume implements IVolume {
    private claimName: string;
    private volume: Volume;

    constructor(claimName: string) {
        this.claimName = claimName;
        this.volume = new Volume(claimName)
    }

    toVolumeMount(mountPath: string): VolumeMount {
        return this.volume.toVolumeMount(mountPath);
    }

    toJson(): any {
        const json = this.volume.toJson();
        json.persistentVolumeClaim = {
            "claimName": this.claimName
        };
        return json;
    }
}