import Naming = require('../../../utilities/naming');
import IResource from "../iresource";

export default class ObjectMeta implements IResource {
    private name: string;
    private namespace: string;
    private labels: any;

    constructor(name: string, namespace: string) {
        this.name = Naming.toDNS1123(name);
        this.namespace = namespace;
        this.labels = {};
    }

    addLabel(key: string, value: any) {
        this.labels[key] = Naming.toDNS1123(value);
    }

    toJson() {
        return {
            "name": this.name,
            "namespace": this.namespace,
            "labels": this.labels
        }
    }
}