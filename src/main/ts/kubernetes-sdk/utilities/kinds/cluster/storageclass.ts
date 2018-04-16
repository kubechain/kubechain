import IKind from "../ikind";

export default class StorageClass implements IKind {
    toPlural(): string {
        return "StorageClasses";
    }

    toString() {
        return "StorageClass";
    }
}