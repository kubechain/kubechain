import ClusterIPService from "../../../../../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/clusterip/clusterip";
import ServicePort from "../../../../../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/ports/serviceport";


export default class OrdererService {
    private service: ClusterIPService;

    constructor(ordererID: string, organizationName: string) {
        this.service = new ClusterIPService(ordererID, organizationName);
        this.service.addMatchLabel("app", "hyperledger");
        this.service.addMatchLabel("role", "orderer");
        this.service.addMatchLabel("orderer-id", ordererID);
        this.service.addMatchLabel("org", organizationName);
        this.service.addServicePort(new ServicePort("listen-endpoint", 7050));
    }

    toJson(): any {
        return this.service.toJson();
    }
}