import ObjectMeta from '../../../meta/objectmeta';
import IPersistentVolumeClaimSpec from "./ipersistentvolumeclaimspec";
import PersistentVolumeClaimVolumeSource from "../volumes/volumesources/persistentvolumeclaimvolumesource";
import IVolumeSource from "../volumes/volumesources/ivolumesource";
import PersistentVolumeClaimSpec from "./persistentvolumeclaimspec";
import IResourceRequirements from "../../../meta/iresourcerequirements";
import ILabelSelector from "../../../meta/ilabeleselector";
import IVolume from "../volumes/ivolume";

export default class PersistentVolumeClaim implements IPersistentVolumeClaimSpec, ILabelSelector, IVolumeSource {
    private metadata: ObjectMeta;
    private volumeSource: PersistentVolumeClaimVolumeSource;
    private spec: PersistentVolumeClaimSpec;

    constructor(name: string, namespace: string) {
        this.metadata = new ObjectMeta(name, namespace);
        this.volumeSource = new PersistentVolumeClaimVolumeSource(name);
        this.spec = new PersistentVolumeClaimSpec();
    }

    addMatchLabel(key: any, value: any): void {
        this.spec.addMatchLabel(key, value);
    }

    addAccessMode(mode: string): void {
        this.spec.addAccessMode(mode);
    }

    setResourceRequirements(resourceRequirements: IResourceRequirements): void {
        this.spec.setResourceRequirements(resourceRequirements);
    }

    setStorageClassName(storageClassName: string): void {
        this.spec.setStorageClassName(storageClassName);
    }

    setVolumeName(volumeName: string): void {
        this.spec.setVolumeName(volumeName);
    }

    toJson(): any {
        return {
            "apiVersion": "v1",
            "kind": "PersistentVolumeClaim",
            "metadata": this.metadata.toJson(),
            "spec": this.spec.toJson()
        };
    }

    toVolume(): IVolume {
        return this.volumeSource.toVolume();
    }
}