import IKind from "../ikind";

export default class PersistentVolume implements IKind {
    toPlural(): string {
        return "PersistentVolumes";
    }

    toString() {
        return "PersistentVolume";
    }
}