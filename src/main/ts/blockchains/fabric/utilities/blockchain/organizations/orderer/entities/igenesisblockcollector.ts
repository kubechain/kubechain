import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";

export default interface IGenesisBlockCollector {
    addGenesisBlockAsVolume(spec: IPodSpec): void;

    mountGenesisBlock(container: IContainer, mountPath: string): void;

    mountGenesisBlockDirectoryFromVolume(container: IContainer, mountPath: string): void;

    mountGenesisBlockFileFromVolume(container: IContainer, mountPath: string): void;
}