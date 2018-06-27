import IResource from "../../iresource";

export default class ContainerPort implements IResource {
    private name: string; // If specified, this must be an IANA_SVC_NAME and unique within the pod.
    private port: number; // This must be a valid port number, 0 < x < 65536.
    private hostIP: string;
    private hostPort: number; // This must be a valid port number, 0 < x < 65536.
    private protocol: string;

    constructor(name: string, port: number) {
        this.name = name;
        this.port = port;
    }

    setHostPort(hostPort: number) {
        this.hostPort = hostPort;
    }

    toJson(): any {
        return {
            "name": this.name,
            "containerPort": this.port,
            "hostIP": this.hostIP,
            "hostPort": this.hostPort,
            "protocol": this.protocol
        };
    }
}