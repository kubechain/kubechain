import IDeploymentSpec from "./ideploymentspec";
import LabelSelector from "../../../meta/labelselector";
import IPodTemplateSpec from "../../pod/template/ipodtemplatespec";
import IContainer from "../../container/icontainer";
import IVolume from "../../../configuration-storage/storage/volumes/ivolume";
import ILabels from "../../pod/template/ilabels";
import PodTemplateSpec from "../../pod/template/podtemplatespec";
import PodSpec from "../../pod/podspec";
import Affinity from "../../pod/affinity/affinity";
import PodSecurityContext from "../../pod/securitycontext";

export default class DeploymentSpec implements IDeploymentSpec, ILabels {
    private selector: LabelSelector;
    private replicas: number;
    private template: IPodTemplateSpec;

    constructor() {
        this.selector = new LabelSelector();
        const template = new PodTemplateSpec();
        template.setSpec(new PodSpec());
        this.template = template;
    }

    addLabel(key: string, value: any): void {
        this.template.addLabel(key, value);
    }

    setTemplate(template: IPodTemplateSpec): void {
        this.template = template;
    }

    setAmountOfReplicas(amount: number): void {
        this.replicas = amount;
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
            "replicas": this.replicas,
            "template": this.template.toJson(),
        };
    }
}