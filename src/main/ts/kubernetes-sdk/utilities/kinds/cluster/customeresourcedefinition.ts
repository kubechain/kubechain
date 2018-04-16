import IKind from "../ikind";

export default class CustomResourceDefinition implements IKind {
    toPlural(): string {
        return "CustomResourceDefinitions";
    }

    toString() {
        return "CustomResourceDefinition";
    }
}