import IVolume from "./ivolume";
import Volume from "./volume";
import KeyToPath from "./volumesources/keytopath";
import VolumeMount from "../../../workloads/container/volumemount";
import IConfigurationVolumeSource from "./volumesources/configuration/iconfigurationvolumesource";

export default class SecretVolume implements IVolume, IConfigurationVolumeSource {
    private name: string;
    private volume: Volume;
    private defaultMode: string;
    private items: Array<KeyToPath>;
    private optional: boolean;


    constructor(configMapName: string) {
        this.name = configMapName;
        this.volume = new Volume(configMapName);
        this.items = [];
        this.optional = false;
    }

    addItem(item: KeyToPath): void {
        this.items.push(item);
    }

    toVolumeMount(mountPath: string): VolumeMount {
        return this.volume.toVolumeMount(mountPath);
    }

    toJson(): any {
        const json = this.volume.toJson();
        json.secret = {
            "defaultMode": this.defaultMode,
            "items": this.items.map(item => {
                return item.toJson()
            }),
            "secretName": this.name,
            "optional": this.optional
        };
        return json;
    }
}