import IContainer from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IChainCodeCollector from "../../../../chaincode/ichainccodecollector";
import IChannelCollector from "../../../../channel/ichannelcollector";
import ICryptographicMaterialCollector from "../../../../cryptographic/icryptographicmaterialcollector";

export default interface IPeer extends IChainCodeCollector, ICryptographicMaterialCollector {
    mountTls(container: IContainer, mountPath: string): void;

    mountMsp(container: IContainer, mountPath: string): void;

    mountCryptographicMaterialFromVolume(container: IContainer, mountPath: string): void;

    addVolume(spec: IPodSpec): void;

    addKubeDnsIpToArray(array: string[]): void;
}