import IKind from "../ikind";

export default class Node implements IKind {
    toPlural(): string {
        return "Nodes";
    }

    toString() {
        return "Node";
    }
}