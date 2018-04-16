import IKind from "../ikind";

export default class Namespace implements IKind {
    toPlural(): string {
        return "Namespaces";
    }

    toString() {
        return "Namespace";
    }
}