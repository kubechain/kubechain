import IKind from "../ikind";

export default class PersistentVolumeClaim implements IKind {
    toPlural(): string {
        return "PersistentVolumeClaim";
    }

    toString() {
        return "PersistentVolumeClaim";
    }
}