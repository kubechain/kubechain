import ObjectMeta from '../../../meta/objectmeta';
import HostPathPersistentVolume from "./hostpath";
import DirectoryOrCreateHostPathVolumeSource from "../../../configuration-storage/storage/volumes/volumesources/hostpath/directoryorcreate";
import IHostPathVolumeSource from "../../../configuration-storage/storage/volumes/volumesources/hostpath/ihostpathvolumesource";
import IPersistentVolumeSpec from "../specs/ipersistentvolumespec";

export default class DirectoryOrCreateHostPathPersistentVolume implements IHostPathVolumeSource, IPersistentVolumeSpec {
    private persistentVolume: HostPathPersistentVolume;

    constructor(objectMeta: ObjectMeta) {
        this.persistentVolume = new HostPathPersistentVolume(objectMeta);
        this.persistentVolume.setHostPathVolumeSource(new DirectoryOrCreateHostPathVolumeSource());
    }

    setHostPath(path: string) {
        this.persistentVolume.setHostPath(path);
    }

    setStorageClassName(name: string) {
        this.persistentVolume.setStorageClassName(name);
    }

    setCapacity(capacity: object) {
        this.persistentVolume.setCapacity(capacity);
    }

    addAccessMode(accessMode: string): void {
        this.persistentVolume.addAccessMode(accessMode);
    }

    toJson(): any {
        return this.persistentVolume.toJson();
    }
}