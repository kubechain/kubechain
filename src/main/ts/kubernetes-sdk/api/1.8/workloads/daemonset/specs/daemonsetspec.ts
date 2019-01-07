import IDeamonSetSpec from "./idaemonsetspec";
import Affinity from "../../pod/affinity/affinity";
import IPodTemplateSpec from "../../pod/template/ipodtemplatespec";
import PodSecurityContext from "../../pod/securitycontext";
import IContainer from "../../container/icontainer";
import IVolume from "../../../configuration-storage/storage/volumes/ivolume";
import PodTemplateSpec from "../../pod/template/podtemplatespec";
import PodSpec from "../../pod/podspec";
import LabelSelector from "../../../meta/labelselector";
import ILabels from "../../pod/template/ilabels";

export default class DaemonSetSpec implements IDeamonSetSpec, ILabels {
    private template: IPodTemplateSpec;
    private selector: LabelSelector;

    constructor() {
        this.selector = new LabelSelector();
        const template = new PodTemplateSpec();
        template.setSpec(new PodSpec());
        this.template = template;
    }

    setTemplate(template: IPodTemplateSpec): void {
        this.template = template;
    }

    addLabel(key: string, value: any): void {
        this.template.addLabel(key, value);
    }

    addMatchLabel(key: any, value: any): void {
        this.selector.addMatchLabel(key, value);
        this.addLabel(key, value);
    }

    setHostname(hostname: string): void {
        this.template.setHostname(hostname)
    }

    setSubDomain(subDomain: string): void {
        this.template.setSubDomain(subDomain);
    }

    setAffinity(affinity: Affinity): void {
        this.template.setAffinity(affinity);
    }

    setRestartPolicy(policy: string): void {
        //TODO: Implement
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

    toJson(): any {
        return {
            "selector": this.selector.toJson(),
            "template": this.template.toJson(),
        };
    }
}