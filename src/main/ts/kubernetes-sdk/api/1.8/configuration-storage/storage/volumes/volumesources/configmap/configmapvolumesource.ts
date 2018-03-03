import IVolumeSource from "../ivolumesource";
import ConfigMapVolume from "../../configmap";
import IConfigMapVolumeSource from "./iconfigmapvolumesource";
import KeyToPath from "../keytopath";
import IVolume from "../../ivolume";

export default class ConfigMapVolumeSource implements IConfigMapVolumeSource, IVolumeSource {
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