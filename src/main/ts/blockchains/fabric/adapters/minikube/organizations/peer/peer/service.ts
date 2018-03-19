import ServicePort from "../../../../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/ports/serviceport";
import ClusterIPService from "../../../../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/clusterip/clusterip";

export default class PeerService {
    private service: ClusterIPService;

    constructor(organizationName: string, peerID: string) {
        this.service = new ClusterIPService(peerID, organizationName);
        this.service.addMatchLabel("app", "hyperledger");
        this.service.addMatchLabel("org", organizationName);
        this.service.addMatchLabel("role", "peer");
        this.service.addMatchLabel("peer-id", peerID);

        this.service.addServicePort(new ServicePort("external-listen-endpoint", 7051));
        this.service.addServicePort(new ServicePort("chaincode-listen", 7052));
        this.service.addServicePort(new ServicePort("listen", 7053));
    }

    toJson() {
        return this.service.toJson();
    }
}