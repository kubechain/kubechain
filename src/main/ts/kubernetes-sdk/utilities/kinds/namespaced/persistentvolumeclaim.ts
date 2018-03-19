import IKind from "../ikind";

export default class PersistentVolumeClaim implements IKind {
    static toString() {
        return "PersistentVolumeClaim";
    }
}