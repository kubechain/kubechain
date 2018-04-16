import IKind from "../ikind";

export default class StatefulSet implements IKind {
    toPlural(): string {
        return "StatefulSets";
    }

    toString() {
        return "StatefulSet";
    }
}