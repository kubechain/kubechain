import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";

export default interface IChannelCollector {
    addChannelsAsVolumes(spec: IPodSpec): void;

    mountChannels(container: IContainer, mountPath: string): void;
}