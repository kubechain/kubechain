import IResource from "../../../iresource";
import PodAntiAffinity from "./antiaffinity";
import NodeAffinity from "./node/nodeaffinity";

export default class Affinity implements IResource {
    private podAntiAffinity: PodAntiAffinity;
    private nodeAffinity: NodeAffinity;

    constructor() {
    }

    setAntiAffinity(podAntiAffinity: PodAntiAffinity) {
        this.podAntiAffinity = podAntiAffinity;
    }

    setNodeAffinity(nodeAffinity: NodeAffinity) {
        this.nodeAffinity = nodeAffinity;
    }

    toJson(): any {
        return {
            podAntiAffinity: (this.podAntiAffinity) ? this.podAntiAffinity.toJson() : undefined,
            nodeAffinity: (this.nodeAffinity) ? this.nodeAffinity.toJson() : undefined
        };
    }
}

// nodeAffinity
// NodeAffinity 	Describes node affinity scheduling rules for the pod.
//     podAffinity
// PodAffinity 	Describes pod affinity scheduling rules (e.g. co-locate this pod in the same node, zone, etc. as some other pod(s)).
// podAntiAffinity
// PodAntiAffinity 	Describes pod anti-affinity scheduling rules (e.g. avoid putting this pod in the same node, zone, etc. as some other pod(s)).