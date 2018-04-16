import PodAffinityTerm from "./terms/term";
import IResource from "../../../iresource";

export default class PodAntiAffinity implements IResource {
    private requiredTerms: PodAffinityTerm[];

    constructor() {
        this.requiredTerms = [];
    }

    addRequiredPodAffinityTerm(term: PodAffinityTerm) {
        this.requiredTerms.push(term);
    }

    toJson(): any {
        return {
            "requiredDuringSchedulingIgnoredDuringExecution":
                this.requiredTerms.map((term: PodAffinityTerm) => {
                    return term.toJson();
                })
        };
    }

}

// preferredDuringSchedulingIgnoredDuringExecution
// requiredDuringSchedulingIgnoredDuringExecution PodAffinityTerm[]