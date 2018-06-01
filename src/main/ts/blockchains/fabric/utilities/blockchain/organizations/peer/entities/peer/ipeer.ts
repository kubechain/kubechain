import IContainer from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IChainCodeCollector from "../../../../chaincode/ichainccodecollector";
import ICryptographicMaterialCollector from "../../../../cryptographic/icryptographicmaterialcollector";

export default interface IPeer extends IChainCodeCollector, ICryptographicMaterialCollector {
    mountTls(container: IContainer, mountPath: string): void;

    mountMsp(container: IContainer, mountPath: string): void;

    mountCryptographicMaterialIntoVolume(container: IContainer, mountPath: string): void;

    addVolume(spec: IPodSpec): void;

    addKubeDnsIpToArray(array: string[]): void;

    //TODO: Fix below functions they violate 'tell don't ask'
    namespace(): string;

    id(): string;

    organizationName(): string;

    coreId(): string;

    address(): string;

    gossipAddress(): string;

    mspID(): string;
}