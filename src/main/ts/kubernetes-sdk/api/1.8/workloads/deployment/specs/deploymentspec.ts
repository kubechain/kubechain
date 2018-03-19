import IDeploymentSpec from "./ideploymentspec";
import LabelSelector from "../../../meta/labelselector";
import IPodTemplateSpec from "../../pod/template/ipodtemplatespec";
import IContainer from "../../container/icontainer";
import IVolume from "../../../configuration-storage/storage/volumes/ivolume";
import ILabels from "../../pod/template/ilabels";
import PodTemplateSpec from "../../pod/template/podtemplatespec";
import PodSpec from "../../pod/podspec";

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

    setRestartPolicy(policy: string): void {
        //TODO: Implement
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

    toJson(): any {
        return {
            "selector": this.selector.toJson(),
            "replicas": this.replicas,
            "template": this.template.toJson(),
        };
    }
}