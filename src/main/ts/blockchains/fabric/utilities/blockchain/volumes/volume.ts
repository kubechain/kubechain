import {ordererTlsPathInContainer} from "../cryptographic/paths";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IVolume from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import VolumeMount from "../../../../../kubernetes-sdk/api/1.8/workloads/container/volumemount";

export default class FabricVolume implements IVolume {
    private volume: IVolume;

    constructor(volume: IVolume) {
        this.volume = volume;
    }

    mount(container: IContainer, mountPath: string, subPath: string) {
        const volumeMount = this.volume.toVolumeMount(mountPath);
        volumeMount.setSubPath(subPath);
        container.addVolumeMount(volumeMount);
    }

    toVolumeMount(mountPath: string): VolumeMount {
        return this.volume.toVolumeMount(mountPath);
    }

    toJson(): any {
        return this.volume.toJson();
    }
}