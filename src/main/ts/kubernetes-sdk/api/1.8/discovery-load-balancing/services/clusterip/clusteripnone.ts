import ClusterIPService from "./clusterip";
import IServicePort from "../ports/iserviceport";
import IServiceSpec from "../specs/iservicespec";

export default class ClusterIPNoneService implements IServiceSpec {
    private service: ClusterIPService;

    constructor(name: string, namespace: string) {
        this.service = new ClusterIPService(name, namespace);
        this.service.setClusterIP("None");
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