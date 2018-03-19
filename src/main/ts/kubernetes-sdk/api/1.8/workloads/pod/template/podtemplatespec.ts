import IPodTemplateSpec from "./ipodtemplatespec";
import IPodSpec from "../ipodspec";
import ObjectMeta from "../../../meta/objectmeta";
import IContainer from "../../container/icontainer";
import IVolume from "../../../configuration-storage/storage/volumes/ivolume";

export default class PodTemplateSpec implements IPodTemplateSpec {
    private spec: IPodSpec;
    private metadata: ObjectMeta;

    constructor() {
        this.metadata = new ObjectMeta(undefined, undefined);
    }

    setSpec(spec: IPodSpec) {
        this.spec = spec;
    }

    //TODO: Consider creating an interface for this.
    addLabel(key: string, value: any) {
        this.metadata.addLabel(key, value)
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
            "metadata": this.metadata.toJson(),
            "spec": this.spec.toJson()
        };
    }

}