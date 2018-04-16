import IKind from "../ikind";

export default class ServiceAccount implements IKind {
    toPlural(): string {
        return "ServiceAccounts";
    }

    toString() {
        return "ServiceAccount";
    }
}