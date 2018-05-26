import ConfigMapVolume from "../../../configmap";
import KeyToPath from "../../keytopath";
import IVolume from "../../../ivolume";
import IConfigurationVolumeSource from "../iconfigurationvolumesource";

export default class ConfigMapVolumeSource implements IConfigurationVolumeSource {
    private configMapVolume: ConfigMapVolume;

    constructor(configMapName: string) {
        this.configMapVolume = new ConfigMapVolume(configMapName);
    }

    addItem(item: KeyToPath): void {
        this.configMapVolume.addItem(item);
    }

    toVolume(): IVolume {
        return this.configMapVolume;
    }
}