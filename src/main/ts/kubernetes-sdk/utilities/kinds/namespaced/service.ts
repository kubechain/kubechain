import IKind from "../ikind";

export default class Service implements IKind {
    toPlural(): string {
        return "Services";
    }

    toString() {
        return "Service";
    }
}