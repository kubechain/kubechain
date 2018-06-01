import Options from "../../../../../options";
import PeerOrganization from "../../peer";
import CertificateAuthorityRepresentation from "../../../../../utilities/blockchain/representation/certificateauthorities/ca/representation";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import PersistentVolumeClaim from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import ResourceWriter from "../../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IHasResources from "../../../../../utilities/blockchain/organizations/ihasresources";
import ICertificateAuthority from "../../../../../utilities/blockchain/organizations/peer/entities/ca/icertificateauthority";
import {caPathInContainer} from "../../../../../utilities/blockchain/cryptographic/paths";
import CertificateAuthorityDeployment from "../../../../../utilities/blockchain/organizations/peer/entities/ca/deployment";
import CertificateAuthorityService from "../../../../../utilities/blockchain/organizations/peer/entities/ca/service";
import FabricVolume from "../../../../../utilities/blockchain/volumes/volume";

export default class CertificateAuthority implements IHasResources, ICertificateAuthority {
    private organization: PeerOrganization;
    private representation: CertificateAuthorityRepresentation;
    private options: Options;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private volume: FabricVolume;

    constructor(organization: PeerOrganization, representation: CertificateAuthorityRepresentation, options: Options) {
        this.organization = organization;
        this.representation = representation;
        this.options = options;

        this.createVolume();
    }

    namespace() {
        return this.organization.namespace();
    }

    organizationName() {
        return this.organization.name();
    }

    private createVolume() {
        this.persistentVolumeClaim = new PersistentVolumeClaim("ca", this.organization.namespace());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);
        this.volume = new FabricVolume(this.persistentVolumeClaim.toVolume());
    }

    addResources(writer: ResourceWriter, outputPath: string) {
        const caService = new CertificateAuthorityService(this.organization.name());
        const caDeployment = new CertificateAuthorityDeployment(this, this.representation, this.options);

        writer.addWorkload({path: outputPath, name: "ca-deployment", resource: caDeployment});
        writer.addResource({path: outputPath, name: "ca-service", resource: caService});
        writer.addResource({path: outputPath, name: "ca-pvc", resource: this.persistentVolumeClaim});
    }

    mountCryptographicMaterial(container: IContainer, mountPath: string): void {
        this.organization.mountCertificateAuthorityCryptographicMaterial(container, mountPath);
    }

    mountCryptographicMaterialFromVolume(container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, caPathInContainer());
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec): void {
        this.organization.addCertificateAuthorityCryptographicMaterialAsVolumes(spec);
    }

    addVolumeToPodSpec(podSpec: IPodSpec) {
        podSpec.addVolume(this.volume);
    }
}