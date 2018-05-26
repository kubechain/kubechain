import ObjectMeta from "../../../meta/objectmeta";
import IConfigurationResource from "../iconfigurationresource";
import KeyToPath from "../../storage/volumes/volumesources/keytopath";
import ConfigMapVolumeSource from "../../storage/volumes/volumesources/configuration/configmap/configmapvolumesource";
import IVolume from "../../storage/volumes/ivolume";

export default class ConfigMap implements IConfigurationResource {
    private metadata: ObjectMeta;
    private data: any;
    private volumeSource: ConfigMapVolumeSource;

    constructor(name: string, namespace: string) {
        this.metadata = new ObjectMeta(name, namespace);
        this.data = {};
        this.volumeSource = new ConfigMapVolumeSource(name);
    }

    addItem(item: KeyToPath): void {
        this.volumeSource.addItem(item);
    }

    addDataPair(key: string, value: any): void {
        this.data[key] = value;
    }

    toVolume(): IVolume {
        return this.volumeSource.toVolume();
    }

    toJson(): any {
        return {
            "apiVersion": "v1",
            "kind": "ConfigMap",
            "metadata": this.metadata.toJson(),
            "data": this.data
        };
    }
}