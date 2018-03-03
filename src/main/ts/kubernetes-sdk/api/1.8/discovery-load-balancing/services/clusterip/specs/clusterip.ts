import IClusterIPServiceSpec from "./iclusteripspec";
import ServiceSpec from "../../specs/servicespec";
import IServicePort from "../../ports/iserviceport";


export default class ClusterIpServiceSpec implements IClusterIPServiceSpec {
    private serviceSpec: ServiceSpec;
    private clusterIP: string;

    constructor() {
        this.serviceSpec = new ServiceSpec("ClusterIP");
    }

    setClusterIP(clusterIP: string) {
        this.clusterIP = clusterIP;
    }

    addServicePort(port: IServicePort): void {
        this.serviceSpec.addServicePort(port);
    }

    addMatchLabel(key: any, value: any): void {
        this.serviceSpec.addMatchLabel(key, value);
    }

    toJson(): any {
        const json = this.serviceSpec.toJson();
        json.clusterIP = this.clusterIP;
        return json;
    }
}