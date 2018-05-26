import KeyToPath from "../../keytopath";
import IVolume from "../../../ivolume";
import SecretVolume from "../../../secret";
import IConfigurationVolumeSource from "../iconfigurationvolumesource";
import IVolumeSource from "../../ivolumesource";

export default class SecretVolumeSource implements IVolumeSource, IConfigurationVolumeSource {
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