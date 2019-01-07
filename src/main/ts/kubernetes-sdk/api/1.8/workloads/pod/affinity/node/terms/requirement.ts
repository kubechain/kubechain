import IResource from "../../../../../iresource";

export default class NodeSelectorRequirement implements IResource {
    private key: string;
    private operator: string;
    private values: string[];

    constructor(key: string, operator: string) {
        this.key = key;
        this.operator = operator;
        this.values = [];
    }

    addValue(value: string) {
        this.values.push(value);
    }

    toJson(): any {
        return {
            key: this.key,
            operator: this.operator,
            values: this.values
        }
    }
}