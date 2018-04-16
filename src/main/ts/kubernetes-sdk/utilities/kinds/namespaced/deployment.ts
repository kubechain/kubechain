import IKind from "../ikind";

export default class Deployment implements IKind {
    toPlural(): string {
        return "Deployments";
    }

    toString() {
        return "Deployment"

    }
}