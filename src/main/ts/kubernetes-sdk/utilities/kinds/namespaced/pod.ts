import IKind from "../ikind";

export default class Pod implements IKind {
    toPlural(): string {
        return "Pods";
    }

    toString() {
        return "Pod";
    }
}