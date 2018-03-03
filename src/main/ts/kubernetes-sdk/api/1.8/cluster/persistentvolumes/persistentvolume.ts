import IResource from "../../iresource";
import ObjectMeta from "../../meta/objectmeta";
import IPersistentVolumeSpec from "./specs/ipersistentvolumespec";

export default class PersistentVolume implements IResource {
    private objectMeta: ObjectMeta;
    private spec: IPersistentVolumeSpec;

    constructor(objectMeta: ObjectMeta) {
        this.objectMeta = objectMeta;
    }

    setSpec(spec: IPersistentVolumeSpec): void {
        this.spec = spec;
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