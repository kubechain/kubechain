import IServicePort from "../ports/iserviceport";
import Service from "../service";
import ClusterIpServiceSpec from "./specs/clusterip";
import IClusterIPServiceSpec from "./specs/iclusteripspec";

export default class ClusterIPService implements IClusterIPServiceSpec {
    private service: Service;
    private spec: IClusterIPServiceSpec;

    constructor(name: string, namespace: string) {
        this.service = new Service(name, namespace);
        this.spec = new ClusterIpServiceSpec();
        this.service.setSpec(this.spec);
    }

    setClusterIP(clusterIP: string): void {
        this.spec.setClusterIP(clusterIP);
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