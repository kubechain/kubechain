import IResource from "../../iresource";
import IPodSpec from "./ipodspec";
import ObjectMeta from "../../meta/objectmeta";

export default class Pod implements IResource {
    private spec: IPodSpec;
    private metadata: ObjectMeta;

    constructor(objectMeta: ObjectMeta) {
        this.metadata = objectMeta;
    }

    setSpec(spec: IPodSpec) {
        this.spec = spec;
    }

    toJson() {
        return {
            "apiVersion": "v1",
            "kind": "Pod",
            "metadata": this.metadata.toJson(),
            "spec": this.spec.toJson()
        }
    }
}