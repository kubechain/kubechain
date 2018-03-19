import IConfigurationResource from "../iconfigurationresource";
import ObjectMeta from "../../../meta/objectmeta";
import SecretVolumeSource from "../../storage/volumes/volumesources/secret/secretvolumesource";
import KeyToPath from "../../storage/volumes/volumesources/keytopath";
import IVolume from "../../storage/volumes/ivolume";
import ISecret from "./isecret";

export default class Secret implements ISecret {
    private data: any;
    private metadata: ObjectMeta;
    private type: string;
    private volumeSource: SecretVolumeSource;

    constructor(name: string, namespace: string, type: string) {
        this.metadata = new ObjectMeta(name, namespace);
        this.type = type;
        this.data = {};
        this.volumeSource = new SecretVolumeSource(name);
    }

    addItem(item: KeyToPath): void {
        this.volumeSource.addItem(item);
    }

    addDataPair(key: string, value: Buffer): void {
        this.data[key] = value.toString('base64');
    }

    toVolume(): IVolume {
        return this.volumeSource.toVolume();
    }

    toJson(): any {
        return {
            "apiVersion": "v1",
            "kind": "Secret",
            "metadata": this.metadata.toJson(),
            "type": this.type,
            "data": this.data
        };
    }
}