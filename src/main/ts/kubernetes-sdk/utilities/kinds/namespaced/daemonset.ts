import IKind from "../ikind";

export default class DaemonSet implements IKind {
    toPlural(): string {
        return "DaemonSets";
    }

    toString() {
        return "DaemonSet"

    }
}