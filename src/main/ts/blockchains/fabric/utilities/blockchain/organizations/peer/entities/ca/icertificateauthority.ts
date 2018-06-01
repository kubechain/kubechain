import IContainer from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import ICryptographicMaterialCollector from "../../../../cryptographic/icryptographicmaterialcollector";

export default interface ICertificateAuthority extends ICryptographicMaterialCollector {
    mountCryptographicMaterialFromVolume(container: IContainer, mountPath: string): void;

    addVolumeToPodSpec(podSpec: IPodSpec): void;

    //TODO: Fix below functions they violate 'tell don't ask'
    namespace(): string;

    organizationName(): string;
}