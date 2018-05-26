import IVolume from "./ivolume";
import Volume from "./volume";
import KeyToPath from "./volumesources/keytopath";
import VolumeMount from "../../../workloads/container/volumemount";
import IConfigurationVolumeSource from "./volumesources/configuration/iconfigurationvolumesource";

export default class ConfigMapVolume implements IVolume, IConfigurationVolumeSource {
    private name: string;
    private volume: Volume;
    private defaultMode: string;
    private items: Array<KeyToPath>;
    private configMapOrKeysMustBeDefined: boolean;


    constructor(configMapName: string) {
        this.name = configMapName;
        this.volume = new Volume(configMapName);
        this.items = [];
        this.configMapOrKeysMustBeDefined = false;
    }

    addItem(item: KeyToPath): void {
        this.items.push(item.toJson());
    }

    toVolumeMount(mountPath: string): VolumeMount {
        return this.volume.toVolumeMount(mountPath);
    }

    toJson(): any {
        const json = this.volume.toJson();
        json.configMap = {
            "defaultMode": this.defaultMode,
            "items": this.items,
            "name": this.name,
            "optional": this.configMapOrKeysMustBeDefined
        };
        return json;
    }
}