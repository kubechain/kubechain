import IResource from "../../../../iresource";
import NodeSelectorTerm from "./terms/selector";

export default class NodeSelector implements IResource {
    private nodeSelectorTerms: NodeSelectorTerm[];

    constructor() {
        this.nodeSelectorTerms = [];
    }

    addNodeSelectorTerm(term: NodeSelectorTerm) {
        this.nodeSelectorTerms.push(term);
    }

    toJson(): any {
        return {
            nodeSelectorTerms:
                this.nodeSelectorTerms.map((selectorTerm: NodeSelectorTerm) => {
                    return selectorTerm.toJson()
                })
        }
    }
}