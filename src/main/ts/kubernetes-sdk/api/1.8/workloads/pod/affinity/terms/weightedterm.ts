import IResource from "../../../../iresource";
import PodAffinityTerm from "./term";

export default class WeightedPodAffinityTerm implements IResource {
    private weight: number;
    private term: PodAffinityTerm;

    constructor() {
        this.weight = 1;
        this.term = undefined;
    }

    setWeight(weight: number) {
        this.weight = weight;
    }

    setPodAffinityTerm(term: PodAffinityTerm) {
        this.term = term;
    }

    toJson() {
        return {
            "weight": this.weight,
            "podAffinityTerm": (this.term) ? this.term.toJson() : undefined
        }
    }
}