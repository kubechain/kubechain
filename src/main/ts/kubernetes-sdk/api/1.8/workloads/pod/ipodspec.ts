import IVolume from "../../configuration-storage/storage/volumes/ivolume";
import IContainer from "../container/icontainer";
import IResource from "../../iresource";

export default interface IPodSpec extends IResource {
    setHostname(hostname: string): void;

    setSubDomain(subdomain: string): void;

    setRestartPolicy(policy: string): void;

    addInitContainer(container: IContainer): void;

    addContainer(container: IContainer): void;

    addVolume(volume: IVolume): void;
}
