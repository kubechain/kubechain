import ObjectMeta from "../../meta/objectmeta";
import IDeploymentSpec from "./specs/ideploymentspec";
import DeploymentSpec from "./specs/deploymentspec";
import IContainer from "../container/icontainer";
import IVolume from "../../configuration-storage/storage/volumes/ivolume";

export default class Deployment implements IDeploymentSpec {
    private metadata: ObjectMeta;
    private spec: DeploymentSpec;

    constructor(name: string, namespace: string) {
        this.metadata = new ObjectMeta(name, namespace);
        this.spec = new DeploymentSpec();

    }

    setSpec(spec: DeploymentSpec) {
        this.spec = spec;
    }

    setAmountOfReplicas(amount: number): void {
        this.spec.setAmountOfReplicas(amount)
    }

    addMatchLabel(key: any, value: any): void {
        this.spec.addMatchLabel(key, value);
        this.spec.addLabel(key, value);
    }

    setHostname(hostname: string): void {
        this.spec.setHostname(hostname);
    }

    setSubDomain(subdomain: string): void {
        this.spec.setSubDomain(subdomain);
    }

    setRestartPolicy(policy: string): void {
        //TODO: Implement
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
            "apiVersion": "apps/v1beta2",
            "kind": "Deployment",
            "metadata": this.metadata.toJson(),
            "spec": this.spec.toJson(),
        };
    }

}