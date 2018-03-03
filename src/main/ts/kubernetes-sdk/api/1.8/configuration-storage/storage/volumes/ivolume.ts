import IResource from "../../../iresource";
import VolumeMount from "../../../workloads/container/volumemount";

export default interface IVolume extends IResource {
    toVolumeMount(mountPath: string): VolumeMount;
}