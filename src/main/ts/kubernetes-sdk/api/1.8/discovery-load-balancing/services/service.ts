import ObjectMeta from "../../meta/objectmeta";
import IServiceSpec from "./specs/iservicespec";
import IServicePort from "./ports/iserviceport";

// type determines how the Service is exposed. Defaults to ClusterIP. Valid options are ExternalName, ClusterIP, NodePort, and LoadBalancer.


export default class Service implements IServiceSpec {
    private name: string;
    private namespace: string;
    private metadata: ObjectMeta;
    private spec: IServiceSpec;

    constructor(name: string, namespace: string) {
        this.name = name;
        this.namespace = namespace;
        this.metadata = new ObjectMeta(name, namespace);
    }

    setSpec(serviceSpec: IServiceSpec) {
        this.spec = serviceSpec;
    }

    addServicePort(port: IServicePort): void {
        this.spec.addServicePort(port);
    }

    addMatchLabel(key: string, value: any): void {
        this.spec.addMatchLabel(key, value);
    }

    toJson(): any {
        return {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": this.metadata.toJson(),
            "spec": this.spec.toJson()
        };
    }
}