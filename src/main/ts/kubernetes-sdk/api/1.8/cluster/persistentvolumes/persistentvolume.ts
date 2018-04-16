import ObjectMeta from "../../meta/objectmeta";
import IPersistentVolumeSpec from "./specs/ipersistentvolumespec";

export default class PersistentVolume implements IPersistentVolumeSpec {
    private objectMeta: ObjectMeta;
    private spec: IPersistentVolumeSpec;

    constructor(objectMeta: ObjectMeta) {
        this.objectMeta = objectMeta;
    }

    setSpec(spec: IPersistentVolumeSpec): void {
        this.spec = spec;
    }

    addAccessMode(accessMode: string): void {
        this.spec.addAccessMode(accessMode);
    }

    setCapacity(capacity: object): void {
        this.spec.setCapacity(capacity);
    }

    setStorageClassName(storageClassName: string): void {
        this.spec.setStorageClassName(storageClassName);
    }

    toJson() {
        return {
            "apiVersion": "v1",
            "kind": "PersistentVolume",
            "metadata": this.objectMeta.toJson(),
            "spec": this.spec.toJson()
        }
    }
}