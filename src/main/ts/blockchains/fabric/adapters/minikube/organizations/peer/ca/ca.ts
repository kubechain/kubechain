import CertificateAuthorityService from './service';
import CertificateAuthorityDeployment from './deployment';
import Options from "../../../../../options";
import PeerOrganization from "../../peer";
import CertificateAuthorityRepresentation from "../../../../../utilities/blockchain/representation/certificateauthorities/ca/representation";
import ResourceWriter from "../../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IHasResources from "../../../../../utilities/blockchain/organizations/ihasresources";
import ICertificateAuthority from "../../../../../utilities/blockchain/organizations/peer/entities/ca/icertificateauthority";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";

export default class CertificateAuthority implements IHasResources, ICertificateAuthority {
    private organization: PeerOrganization;
    private representation: CertificateAuthorityRepresentation;
    private options: Options;

    constructor(organization: PeerOrganization, representation: CertificateAuthorityRepresentation, options: Options) {
        this.organization = organization;
        this.representation = representation;
        this.options = options;
    }

    namespace() {
        return this.organization.namespace();
    }

    organizationName() {
        return this.organization.name();
    }

    addResources(writer: ResourceWriter, outputPath: string) {
        const caService = new CertificateAuthorityService(this.organization.name());
        const caDeployment = new CertificateAuthorityDeployment(this, this.representation, this.options);
        writer.addWorkload({path: outputPath, name: "ca-deployment", resource: caDeployment});
        writer.addResource({path: outputPath, name: "ca-service", resource: caService});
    }

    mountCryptographicMaterial(container: IContainer, mountPath: string): void {
        this.organization.mountCertificateAuthorityCryptographicMaterial(container, mountPath);
    }

    mountCryptographicMaterialFromVolume(container: IContainer, mountPath: string): void {
        this.organization.mountCertificateAuthorityCryptographicMaterialFromVolume(container, mountPath);
    }

    addVolumeToPodSpec(podSpec: IPodSpec): void {
        this.organization.addVolumeToPodSpec(podSpec);
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec): void {
        this.organization.addCertificateAuthorityCryptographicMaterialAsVolumes(spec);
    }
}

