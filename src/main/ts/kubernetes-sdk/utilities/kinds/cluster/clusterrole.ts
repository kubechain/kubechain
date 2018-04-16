import IKind from "../ikind";

export default class ClusterRole implements IKind {
    toPlural(): string {
        return "ClusterRoles";
    }

    toString() {
        return "ClusterRole";
    }
}