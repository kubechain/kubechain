import IResource from "../../../iresource";
import ServicePort from "./serviceport";
import IServicePort from "./iserviceport";

export default class NodeServicePort implements IResource, IServicePort {
    private nodePort: number; // when type=NodePort or LoadBalancer.
    private servicePort: ServicePort;

    constructor(name: string, port: number) {
        this.servicePort = new ServicePort(name, port)
    }

    setNodePort(nodePort: number) {
        this.nodePort = nodePort;
    }

    setProtocol(protocol: string) {
        this.servicePort.setProtocol(protocol);
    }

    setTargetPort(targetPort: number) {
        this.servicePort.setTargetPort(targetPort);
    }

    toJson(): any {
        const json = this.servicePort.toJson();
        json.nodePort = this.nodePort;
        return json;
    }
}