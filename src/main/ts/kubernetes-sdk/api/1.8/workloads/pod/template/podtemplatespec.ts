import IPodTemplateSpec from "./ipodtemplatespec";
import IPodSpec from "../ipodspec";
import ObjectMeta from "../../../meta/objectmeta";
import IContainer from "../../container/icontainer";
import IVolume from "../../../configuration-storage/storage/volumes/ivolume";
import Affinity from "../affinity/affinity";
import PodSecurityContext from "../securitycontext";

export default class PodTemplateSpec implements IPodTemplateSpec {
    private spec: IPodSpec;
    private metadata: ObjectMeta;

    constructor() {
        this.metadata = new ObjectMeta(undefined, undefined);
    }

    setSpec(spec: IPodSpec) {
        this.spec = spec;
    }

    addLabel(key: string, value: any) {
        this.metadata.addLabel(key, value)
    }

    setHostname(hostname: string): void {
        this.spec.setHostname(hostname);
    }

    setSubDomain(subdomain: string): void {
        this.spec.setSubDomain(subdomain);
    }

    setAffinity(affinity: Affinity): void {
        this.spec.setAffinity(affinity);
    }

    setRestartPolicy(policy: string): void {
        //TODO: Implement
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
            "metadata": this.metadata.toJson(),
            "spec": this.spec.toJson()
        };
    }
}