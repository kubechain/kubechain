import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";

export default interface IChainCodeCollector {
    mountChainCodes(container: IContainer, mountPath: string): void;

    addChainCodeAsVolumes(spec: IPodSpec): void;
}