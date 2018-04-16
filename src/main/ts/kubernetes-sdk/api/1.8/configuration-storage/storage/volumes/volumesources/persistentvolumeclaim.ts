import IVolumeSource from "./ivolumesource";
import IVolume from "../ivolume";
import PersistentVolumeClaimVolume from "../persistentvolumeclaim";
import IPersistentVolumeSource from "./ipersistentvolumesource";

export default class PersistentVolumeClaimVolumeSource implements IVolumeSource, IPersistentVolumeSource {
    private persistentVolumeClaimVolume: PersistentVolumeClaimVolume;

    constructor(claimName: string) {
        this.persistentVolumeClaimVolume = new PersistentVolumeClaimVolume(claimName);
    }

    toVolume(): IVolume {
        return this.persistentVolumeClaimVolume;
    }
}