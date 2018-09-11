import IServiceSpec from "../specs/iservicespec";
import Service from "../service";
import LoadBalancerServiceSpec from "./specs/loadbalancer";
import IServicePort from "../ports/iserviceport";

export default class LoadBalancerService implements IServiceSpec {
    private service: Service;
    private spec: LoadBalancerServiceSpec;

    constructor(name: string, namespace: string) {
        this.service = new Service(name, namespace);
        this.spec = new LoadBalancerServiceSpec();
        this.service.setSpec(this.spec);
    }

    setLoadBalancerIp(loadBalancerIp: string): void {
        this.spec.setLoadBalancerIP(loadBalancerIp);
    }

    addServicePort(port: IServicePort): void {
        this.service.addServicePort(port);
    }

    addMatchLabel(key: any, value: any): void {
        this.service.addMatchLabel(key, value);
    }

    toJson(): any {
        return this.service.toJson();
    }
}