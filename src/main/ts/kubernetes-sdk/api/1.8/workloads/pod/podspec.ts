import IPodSpec from "./ipodspec";
import IVolume from "../../configuration-storage/storage/volumes/ivolume";
import IContainer from "../container/icontainer";

export default class PodSpec implements IPodSpec {
    private hostname: string;
    private subdomain: string;
    private restartPolicy: string;
    private initContainers: IContainer[];
    private containers: IContainer[];
    private volumes: IVolume[];

    constructor() {
        this.initContainers = [];
        this.containers = [];
        this.volumes = [];
    }

    setHostname(hostname: string) {
        this.hostname = hostname;
    }

    setSubDomain(subdomain: string) {
        this.subdomain = subdomain;
    }

    setRestartPolicy(policy: string): void {
        this.restartPolicy = policy;
    }

    addInitContainer(container: IContainer): void {
        this.initContainers.push(container);
    }

    addContainer(container: IContainer): void {
        this.containers.push(container);
    }

    addVolume(volume: IVolume): void {
        this.volumes.push(volume);
    }

    toJson() {
        return {
            "hostname": this.hostname,
            "subdomain": this.subdomain,
            "restartPolicy": this.restartPolicy,
            "initContainers": this.initContainers.map(initContainer => {
                return initContainer.toJson();
            }),
            "containers": this.containers.map(container => {
                return container.toJson();
            }),
            "volumes": this.volumes.map((volume: IVolume) => {
                return volume.toJson();
            }),
        };
    }
}