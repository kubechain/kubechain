import IServicePort from "../ports/iserviceport";
import Service from "../service";
import IServiceSpec from "../specs/iservicespec";
import NodePortServiceSpec from "./specs/nodeport";

export default class NodePortService implements IServiceSpec {
    private service: Service;
    private spec: IServiceSpec;

    constructor(name: string, namespace: string) {
        this.service = new Service(name, namespace);
        this.spec = new NodePortServiceSpec();
        this.service.setSpec(this.spec);
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