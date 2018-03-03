import IResource from "../../../iresource";
import IServicePort from "./iserviceport";

export default class ServicePort implements IResource, IServicePort {
    private name: string;
    private port: number; //The port that will be exposed by this service.
    private protocol: string; //The IP protocol for this port. Supports "TCP" and "UDP". Default is TCP.
    private targetPort: number; //If this is not specified, the value of the 'port' field is used (an identity map).

    constructor(name: string, port: number) {
        this.name = name;
        this.port = port;
    }

    setProtocol(protocol: string) {
        this.protocol = protocol
    }

    setTargetPort(targetPort: number): void {
        this.targetPort = targetPort;
    }

    toJson(): any {
        return {
            name: this.name,
            port: this.port,
            protocol: this.protocol,
            targetPort: this.targetPort
        };
    }
}