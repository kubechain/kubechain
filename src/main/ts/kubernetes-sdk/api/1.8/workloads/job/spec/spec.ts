import IJobSpec from "./ijobspec";
import LabelSelector from "../../../meta/labelselector";
import ILabelSelector from "../../../meta/ilabeleselector";
import Affinity from "../../pod/affinity/affinity";
import PodSecurityContext from "../../pod/securitycontext";
import IResource from "../../../iresource";
import IVolume from "../../../configuration-storage/storage/volumes/ivolume";
import IContainer from "../../container/icontainer";
import PodTemplateSpec from "../../pod/template/podtemplatespec";
import PodSpec from "../../pod/podspec";

export default class JobSpec implements IJobSpec, IResource {
    private backOffLimit: number;
    private completions: number;
    private selector: ILabelSelector;
    private template: PodTemplateSpec;

    constructor() {
        this.backOffLimit = 6;
        this.completions = 1;
        this.selector = new LabelSelector();
        this.template = new PodTemplateSpec();
        const spec = new PodSpec();
        spec.setRestartPolicy("Never");
        this.template.setSpec(spec)
    }

    setBackOffLimit(backOffLimit: number): void {
        this.backOffLimit = backOffLimit;
    }

    addMatchLabel(key: any, value: any): void {
        this.selector.addMatchLabel(key, value);
    }

    addLabel(key: string, value: any): void {
        this.template.addLabel(key, value);
    }

    setAffinity(affinity: Affinity): void {
        this.template.setAffinity(affinity);
    }

    setHostname(hostname: string): void {
        this.template.setHostname(hostname);
    }

    setSubDomain(subdomain: string): void {
        this.template.setSubDomain(subdomain);
    }

    setRestartPolicy(policy: string): void {
        this.template.setRestartPolicy(policy);
    }

    setPodSecurityContext(podSecurityContext: PodSecurityContext): void {
        this.template.setPodSecurityContext(podSecurityContext);
    }

    addInitContainer(container: IContainer): void {
        this.template.addInitContainer(container);
    }

    addContainer(container: IContainer): void {
        this.template.addContainer(container);
    }

    addVolume(volume: IVolume): void {
        this.template.addVolume(volume);
    }

    addNodeSelectorMatchLabel(label: string, value: any): void {
        this.template.addNodeSelectorMatchLabel(label, value);
    }

    toJson() {
        return {
            selector: this.selector.toJson(),
            backoffLimit: this.backOffLimit,
            template: this.template.toJson()
        }
    }

}