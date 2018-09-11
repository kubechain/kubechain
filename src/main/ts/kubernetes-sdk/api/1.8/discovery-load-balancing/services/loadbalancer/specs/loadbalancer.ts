import IServiceSpec from "../../specs/iservicespec";
import ServiceSpec from "../../specs/servicespec";
import IServicePort from "../../ports/iserviceport";

export default class LoadBalancerServiceSpec implements IServiceSpec {
    private serviceSpec: ServiceSpec;
    private loadBalancerIp: string;

    constructor() {
        this.serviceSpec = new ServiceSpec("LoadBalancer");
    }

    setLoadBalancerIP(loadBalancerIp: string) {
        this.loadBalancerIp = loadBalancerIp;
    }

    addServicePort(port: IServicePort): void {
        this.serviceSpec.addServicePort(port);
    }

    addMatchLabel(key: any, value: any): void {
        this.serviceSpec.addMatchLabel(key, value);
    }

    toJson(): any {
        const json = this.serviceSpec.toJson();
        json.loadBalancerIP = this.loadBalancerIp;
        return json;
    }
}