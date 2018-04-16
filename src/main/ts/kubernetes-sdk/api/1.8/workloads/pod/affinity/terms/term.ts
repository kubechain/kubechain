import ILabelSelector from "../../../../meta/ilabeleselector";
import IResource from "../../../../iresource";
import LabelSelector from "../../../../meta/labelselector";

export default class PodAffinityTerm implements ILabelSelector, IResource {
    private labelSelector: LabelSelector;
    private namespaces: string[];
    private topologyKey: string;

    constructor() {
        this.labelSelector = new LabelSelector();
        this.namespaces = [];
    }

    addMatchLabel(key: any, value: any): void {
        this.labelSelector.addMatchLabel(key, value);
    }

    addNamespace(namespace: string) {
        this.namespaces.push(namespace);
    }

    setTopologyKey(key: string) {
        this.topologyKey = key;
    }

    toJson(): any {
        return {
            labelSelector: this.labelSelector.toJson(),
            namespaces: this.namespaces,
            topologyKey: this.topologyKey
        };
    }

}

// labelSelector LabelSelector
// A label query over a set of resources, in this case pods.
//
// namespaces string array
//
// namespaces specifies which namespaces the labelSelector applies to (matches against); null or empty list means "this pod's namespace"
//
// topologyKey string
//
// This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces,
// where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running.
// For PreferredDuringScheduling pod anti-affinity, empty topologyKey is interpreted as "all topologies"
// ("all topologies" here means all the topologyKeys indicated by scheduler command-line argument --failure-domains);
// for affinity and for RequiredDuringScheduling pod anti-affinity, empty topologyKey is not allowed.