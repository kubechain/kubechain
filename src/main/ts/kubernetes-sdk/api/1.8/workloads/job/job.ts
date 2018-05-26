import IResource from "../../iresource";
import ObjectMeta from "../../meta/objectmeta";
import IJobSpec from "./spec/ijobspec";


export default class Job implements IResource {
    private metadata: ObjectMeta;
    private spec: IJobSpec;

    constructor(name: string, namespace: string) {
        this.metadata = new ObjectMeta(name, namespace);
    }

    setSpec(spec: IJobSpec): void {
        this.spec = spec;
    }

    toJson(): any {
        return {
            apiVersion: "batch/v1",
            kind: "Job",
            metadata: this.metadata.toJson(),
            spec: this.spec.toJson()
        };
    }

}