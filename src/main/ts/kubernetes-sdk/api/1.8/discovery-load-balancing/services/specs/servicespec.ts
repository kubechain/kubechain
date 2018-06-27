import IResource from "../../../iresource";
import IServiceSpec from "./iservicespec";
import IServicePort from "../ports/iserviceport";

export default class ServiceSpec implements IResource, IServiceSpec {
    private selector: any;
    private type: string;
    private ports: IServicePort[];

    constructor(type: string) {
        this.type = type;
        this.ports = [];
        this.selector = {}
    }

    addMatchLabel(key: any, value: any): void {
        this.selector[key] = value;
    }

    addServicePort(port: IServicePort): void {
        this.ports.push(port);
    }

    toJson(): any {
        return {
            "selector": this.selector,
            "type": this.type,
            "ports": this.ports.map((port: IServicePort) => {
                return port.toJson()
            })
        }
    }
}