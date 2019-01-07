import ObjectMeta from "../../meta/objectmeta";
import IJobSpec from "./spec/ijobspec";
import Affinity from "../pod/affinity/affinity";
import PodSecurityContext from "../pod/securitycontext";
import IContainer from "../container/icontainer";
import IVolume from "../../configuration-storage/storage/volumes/ivolume";
import JobSpec from "./spec/spec";


export default class Job implements IJobSpec {
    private metadata: ObjectMeta;
    private spec: IJobSpec;

    constructor(name: string, namespace: string) {
        this.metadata = new ObjectMeta(name, namespace);
        this.spec = new JobSpec();
    }

    setSpec(spec: IJobSpec): void {
        this.spec = spec;
    }

    setBackOffLimit(backOffLimit: number): void {
        this.spec.setBackOffLimit(backOffLimit);
    }

    addMatchLabel(key: any, value: any): void {
        this.spec.addMatchLabel(key, value);
    }

    addLabel(key: string, value: any): void {
        this.spec.addLabel(key, value);
    }

    setAffinity(affinity: Affinity): void {
        this.spec.setAffinity(affinity);
    }

    setHostname(hostname: string): void {
        this.spec.setHostname(hostname);
    }

    setSubDomain(subdomain: string): void {
        this.spec.setSubDomain(subdomain);
    }

    setRestartPolicy(policy: string): void {
        this.spec.setRestartPolicy(policy);
    }

    setPodSecurityContext(podSecurityContext: PodSecurityContext): void {
        this.spec.setPodSecurityContext(podSecurityContext);
    }

    addInitContainer(container: IContainer): void {
        this.spec.addInitContainer(container);
    }

    addContainer(container: IContainer): void {
        this.spec.addContainer(container);
    }

    addVolume(volume: IVolume): void {
        this.spec.addVolume(volume);
    }

    addNodeSelectorMatchLabel(label: string, value: any): void {
        this.spec.addNodeSelectorMatchLabel(label, value);
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