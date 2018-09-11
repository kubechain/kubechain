import PodAffinityTerm from "./terms/term";
import IResource from "../../../iresource";
import WeightedPodAffinityTerm from "./terms/weightedterm";

export default class PodAntiAffinity implements IResource {
    private requiredTerms: PodAffinityTerm[];
    private preferredTerms: WeightedPodAffinityTerm[];

    constructor() {
        this.requiredTerms = [];
        this.preferredTerms = [];
    }

    addRequiredPodAffinityTerm(term: PodAffinityTerm) {
        this.requiredTerms.push(term);
    }

    addPreferredPodAffinityTerm(term: WeightedPodAffinityTerm) {
        this.preferredTerms.push(term);
    }

    toJson(): any {
        return {
            "requiredDuringSchedulingIgnoredDuringExecution":
                (this.requiredTerms.length > 0) ? this.requiredTerms.map((term: PodAffinityTerm) => {
                    return term.toJson();
                }) : undefined,
            "preferredDuringSchedulingIgnoredDuringExecution":
                (this.preferredTerms.length > 0) ? this.preferredTerms.map((term: WeightedPodAffinityTerm) => {
                    return term.toJson();
                }) : undefined,
        };
    }

}