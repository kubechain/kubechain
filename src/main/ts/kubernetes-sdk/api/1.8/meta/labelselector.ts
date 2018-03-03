import ILabelSelector from "./ilabeleselector";

export default class LabelSelector implements ILabelSelector {

    private matchLabels: any;

    constructor() {
        this.matchLabels = {};
    }

    addMatchLabel(key: any, value: any) {
        this.matchLabels[key] = value;
    }

    toJson() {
        return {
            "matchLabels": this.matchLabels
        }
    }
}