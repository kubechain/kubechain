import IPodSpec from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IChannelCollector from "../../../../channel/ichannelcollector";
import IChainCodeCollector from "../../../../chaincode/ichainccodecollector";

export default interface ICommandLineInterface extends IChannelCollector, IChainCodeCollector {
    addVolumeToPodSpec(spec: IPodSpec): void;

    mountPeerAdminCryptographicMaterial(container: IContainer, baseMountPath: string): void;

    mountPeerAdminCryptographicMaterialFromVolume(container: IContainer, mountPath: string): void;

    mountMspCryptographicMaterial(container: IContainer, mountPath: string): void;

    addPeerAdminCryptographicMaterialAsVolumes(spec: IPodSpec): void;
}