import IResource from "../../../iresource";
import ObjectMeta from "../../../meta/objectmeta";
import IPersistentVolumeSpec from "../specs/ipersistentvolumespec";
import PersistentVolume from "../persistentvolume";
import HostPathPersistentVolumeSpec from "../specs/hostpath";
import IHostPathVolumeSource from "../../../configuration-storage/storage/volumes/volumesources/hostpath/ihostpathvolumesource";
import TypelessHostPathVolumeSource from "../../../configuration-storage/storage/volumes/volumesources/hostpath/typeless";


export default class HostPathPersistentVolume implements IResource, IHostPathVolumeSource, IPersistentVolumeSpec {
    private persistentVolume: PersistentVolume;
    private hostPathVolumeSpec: HostPathPersistentVolumeSpec;
    private volumeSource: IHostPathVolumeSource;

    constructor(objectMeta: ObjectMeta) {
        this.persistentVolume = new PersistentVolume(objectMeta);
        this.hostPathVolumeSpec = new HostPathPersistentVolumeSpec();
        this.persistentVolume.setSpec(this.hostPathVolumeSpec);
        //TODO: Consider moving to TyplessHostPathPersistentVolume.
        this.setHostPathVolumeSource(new TypelessHostPathVolumeSource());
    }

    setHostPathVolumeSource(volumeSource: IHostPathVolumeSource) {
        this.volumeSource = volumeSource;
        this.hostPathVolumeSpec.setHostPathVolumeSource(this.volumeSource);
    }

    setHostPath(path: string) {
        this.volumeSource.setHostPath(path);
    }

    setStorageClassName(name: string) {
        this.hostPathVolumeSpec.setStorageClassName(name);
    }

    setCapacity(capacity: object) {
        this.hostPathVolumeSpec.setCapacity(capacity);
    }

    addAccessMode(accessMode: string): void {
        this.hostPathVolumeSpec.addAccessMode(accessMode);
    }

    toJson(): any {
        return this.persistentVolume.toJson();
    }
}