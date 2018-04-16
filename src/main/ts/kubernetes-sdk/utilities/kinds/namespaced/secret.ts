import IKind from "../ikind";

export default class Secret implements IKind {
    toPlural(): string {
        return "Secrets";
    }

    toString() {
        return "Secret";
    }
}