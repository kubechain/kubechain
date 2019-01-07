import IVolume from "../../configuration-storage/storage/volumes/ivolume";
import IContainer from "../container/icontainer";
import IResource from "../../iresource";
import Affinity from "./affinity/affinity";
import PodSecurityContext from "./securitycontext";

export default interface IPodSpec extends IResource {
    setAffinity(affinity: Affinity): void;

    setHostname(hostname: string): void;

    setSubDomain(subdomain: string): void;

    setRestartPolicy(policy: string): void;

    setPodSecurityContext(podSecurityContext: PodSecurityContext): void;

    addInitContainer(container: IContainer): void;

    addContainer(container: IContainer): void;

    addVolume(volume: IVolume): void;

    addNodeSelectorMatchLabel(label: string, value: any): void;
}
