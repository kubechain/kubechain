import IPodSpec from "./ipodspec";
import IVolume from "../../configuration-storage/storage/volumes/ivolume";
import IContainer from "../container/icontainer";
import Affinity from "./affinity/affinity";
import PodSecurityContext from "./securitycontext";

export default class PodSpec implements IPodSpec {
    private hostname: string;
    private subdomain: string;
    private affinity: Affinity;
    private restartPolicy: string;
    private initContainers: IContainer[];
    private containers: IContainer[];
    private volumes: IVolume[];
    private podSecurityContext: PodSecurityContext;

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

    setAffinity(affinity: Affinity): void {
        this.affinity = affinity;
    }

    setRestartPolicy(policy: string): void {
        this.restartPolicy = policy;
    }

    setPodSecurityContext(podSecurityContext: PodSecurityContext): void {
        this.podSecurityContext = podSecurityContext;
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
            "affinity": (this.affinity) ? this.affinity.toJson() : undefined,
            "restartPolicy": this.restartPolicy,
            "securityContext": (this.podSecurityContext) ? this.podSecurityContext.toJson() : undefined,
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