import IResource from "../../../iresource";
import IResourceRequirements from "../../../meta/iresourcerequirements";

export default interface IPersistentVolumeClaimSpec extends IResource {
    addAccessMode(mode: string): void;

    setResourceRequirements(resourceRequirements: IResourceRequirements): void;

    setStorageClassName(storageClassName: string): void;

    setVolumeName(volumeName: string): void;
}