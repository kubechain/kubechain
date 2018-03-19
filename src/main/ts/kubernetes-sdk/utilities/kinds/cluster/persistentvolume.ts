import IKind from "../ikind";

export default class PersistentVolume implements IKind {
    static toString() {
        return "PersistentVolume";
    }
}