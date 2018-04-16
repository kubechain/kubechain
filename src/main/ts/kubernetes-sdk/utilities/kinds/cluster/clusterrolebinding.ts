import IKind from "../ikind";

export default class ClusterRoleBinding implements IKind {
    toPlural(): string {
        return "ClusterRoleBindings";
    }

    toString() {
        return "ClusterRoleBinding";
    }
}