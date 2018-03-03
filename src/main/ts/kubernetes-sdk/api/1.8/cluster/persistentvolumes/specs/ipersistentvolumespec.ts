import IResource from "../../../iresource";

export default interface IPersistentVolumeSpec extends IResource {
    addAccessMode(accessMode: string): void;

    setCapacity(capacity: object): void;

    setStorageClassName(storageClassName: string): void;
}