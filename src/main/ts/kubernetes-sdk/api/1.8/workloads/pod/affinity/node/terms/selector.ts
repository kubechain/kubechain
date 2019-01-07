import IResource from "../../../../../iresource";
import NodeSelectorRequirement from "./requirement";

export default class NodeSelectorTerm implements IResource {
    private matchExpressions: NodeSelectorRequirement[];

    constructor() {
        this.matchExpressions = [];
    }

    addNodeSelctorRequirement(requirement: NodeSelectorRequirement) {
        this.matchExpressions.push(requirement);
    }

    toJson(): any {
        return {
            matchExpressions: this.matchExpressions.map((expression: NodeSelectorRequirement) => {
                return expression.toJson()
            })
        }
    }
}
