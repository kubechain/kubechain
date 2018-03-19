import IVolumeSource from "../ivolumesource";
import ISecretVolumeSource from "./isecretvolumesource";
import KeyToPath from "../keytopath";
import IVolume from "../../ivolume";
import SecretVolume from "../../secret";

export default class SecretVolumeSource implements ISecretVolumeSource, IVolumeSource {
    private secretVolume: SecretVolume;

    constructor(configMapName: string) {
        this.secretVolume = new SecretVolume(configMapName);
    }

    addItem(item: KeyToPath): void {
        this.secretVolume.addItem(item);
    }

    toVolume(): IVolume {
        return this.secretVolume;
    }
}