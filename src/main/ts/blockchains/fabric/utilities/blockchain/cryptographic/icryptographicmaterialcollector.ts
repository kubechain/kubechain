import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";

export default interface ICryptographicMaterialCollector {
    addCryptographicMaterialAsVolumes(spec: IPodSpec): void;

    mountCryptographicMaterial(container: IContainer, mountPath: string): void;
}