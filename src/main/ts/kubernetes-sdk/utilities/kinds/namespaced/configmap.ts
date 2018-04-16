import IKind from "../ikind";

export default class ConfigMap implements IKind {
    toPlural(): string {
        return "ConfigMaps";
    }

    toString() {
        return "ConfigMap";
    }
}