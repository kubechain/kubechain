import ServiceSpec from "../../specs/servicespec";
import IServicePort from "../../ports/iserviceport";
import IServiceSpec from "../../specs/iservicespec";

export default class NodePortServiceSpec implements IServiceSpec {
    private serviceSpec: ServiceSpec;

    constructor() {
        this.serviceSpec = new ServiceSpec("NodePort");
    }

    addServicePort(port: IServicePort): void {
        this.serviceSpec.addServicePort(port);
    }

    addMatchLabel(key: any, value: any): void {
        this.serviceSpec.addMatchLabel(key, value);
    }

    toJson(): any {
        return this.serviceSpec.toJson();
    }
}