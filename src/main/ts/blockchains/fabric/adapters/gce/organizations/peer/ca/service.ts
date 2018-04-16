import ServicePort from "../../../../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/ports/serviceport";
import ClusterIPService from "../../../../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/clusterip/clusterip";

export default class CertificationAuthorityService {
    private service: ClusterIPService;

    constructor(organizationName: string) {
        this.service = new ClusterIPService("ca", organizationName);
        this.service.addMatchLabel("app", "hyperledger");
        this.service.addMatchLabel("role", "ca");
        this.service.addMatchLabel("org", organizationName);
        this.service.addMatchLabel("name", "ca");
        this.service.addServicePort(new ServicePort("endpoint", 7054));
    }

    toJson(): any {
        return this.service.toJson();
    }
}