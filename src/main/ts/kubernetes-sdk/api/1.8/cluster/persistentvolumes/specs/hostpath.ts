import PersistentVolumeSpec from "./persistentvolumespec";
import IPersistentVolumeSpec from "./ipersistentvolumespec";
import IHostPathVolumeSource from "../../../configuration-storage/storage/volumes/volumesources/hostpath/ihostpathvolumesource";
import TypelessHostPathVolumeSource from "../../../configuration-storage/storage/volumes/volumesources/hostpath/typeless";

export default class HostPathPersistentVolumeSpec implements IPersistentVolumeSpec {
    private persistentVolumeSpec: PersistentVolumeSpec;
    private hostPathVolumeSource: IHostPathVolumeSource;

    constructor() {
        this.persistentVolumeSpec = new PersistentVolumeSpec();
    }

    addAccessMode(accessMode: string): void {
        this.persistentVolumeSpec.addAccessMode(accessMode);
    }

    setHostPathVolumeSource(hostPathVolumeSource: IHostPathVolumeSource): void {
        this.hostPathVolumeSource = hostPathVolumeSource;
    }

    setStorageClassName(name: string): void {
        this.persistentVolumeSpec.setStorageClassName(name);
    }

    setCapacity(capacity: object): void {
        this.persistentVolumeSpec.setCapacity(capacity);
    }

    toJson(): any {
        const json = this.persistentVolumeSpec.toJson();
        json.hostPath = this.hostPathVolumeSource.toJson();
        return json
    }
}