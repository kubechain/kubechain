import IDaemonSetSpec from "./specs/idaemonsetspec";
import DeamonSetSpec from "./specs/daemonsetspec";
import Affinity from "../pod/affinity/affinity";
import PodSecurityContext from "../pod/securitycontext";
import IContainer from "../container/icontainer";
import IVolume from "../../configuration-storage/storage/volumes/ivolume";
import ObjectMeta from "../../meta/objectmeta";

export default class DaemonSet implements IDaemonSetSpec {
    private spec: IDaemonSetSpec;
    private metadata: ObjectMeta;

    constructor(name: string, namespace: string) {
        this.metadata = new ObjectMeta(name, namespace);
        this.spec = new DeamonSetSpec();
    }

    setSpec(spec: IDaemonSetSpec) {
        this.spec = spec;
    }

    addLabel(key: string, value: any): void {
        this.metadata.addLabel(key, value);
    }

    addMatchLabel(key: any, value: any): void {
        this.spec.addMatchLabel(key, value);
    }

    setAffinity(affinity: Affinity): void {
        this.spec.setAffinity(affinity)
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

    toJson(): any {
        return {
            apiVersion: "apps/v1beta2",
            kind: "DaemonSet",
            metadata: this.metadata.toJson(),
            spec: this.spec.toJson()
        };
    }
}