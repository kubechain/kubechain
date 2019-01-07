import IResource from "../../../../iresource";
import NodeSelector from "./selector";

export default class NodeAffinity implements IResource {
    private nodeSelector: NodeSelector;

    constructor() {
        this.nodeSelector = new NodeSelector();
    }

    setNodeSelector(selector: NodeSelector) {
        this.nodeSelector = selector;
    }

    toJson(): any {
        return {
            requiredDuringSchedulingIgnoredDuringExecution: this.nodeSelector.toJson()
        }
    }
}
