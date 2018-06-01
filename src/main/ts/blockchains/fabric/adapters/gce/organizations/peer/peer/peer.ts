import Options from "../../../../../options";
import OrganizationEntityRepresentation from "../../../../../utilities/blockchain/representation/organizations/entities/representation";
import PeerOrganization from "../../peer";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import * as Path from "path";
import PersistentVolumeClaim from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import IVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import ResourceWriter from "../../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IPeer from "../../../../../utilities/blockchain/organizations/peer/entities/peer/ipeer";
import IHasResources from "../../../../../utilities/blockchain/organizations/ihasresources";
import {
    peerMspPathInContainer, peerPathInContainer, peerPathOnHost,
    peerTlsPathInContainer
} from "../../../../../utilities/blockchain/cryptographic/paths";
import {identifier} from "../../../../../utilities/blockchain/organizations/identifiers";
import PeerDeployment from "../../../../../utilities/blockchain/organizations/peer/entities/peer/deployment";
import PeerService from "../../../../../utilities/blockchain/organizations/peer/entities/peer/service";
import FabricVolume from "../../../../../utilities/blockchain/volumes/volume";

export default class Peer implements IHasResources, IPeer {
    private representation: any;
    private organization: PeerOrganization;
    private options: Options;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private volume: FabricVolume;

    constructor(representation: OrganizationEntityRepresentation, organization: PeerOrganization, options: Options) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;

        this.createVolume();
    }

    private createVolume() {
        this.persistentVolumeClaim = new PersistentVolumeClaim(this.id() + "-pvc", this.organization.namespace());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);
        this.volume = new FabricVolume(this.persistentVolumeClaim.toVolume());
    }

    private name(): string {
        return this.representation.name;
    }

    id(): string {
        return identifier(this.name());
    }

    coreId() {
        return this.representation.name;
    }

    address() {
        return this.representation.name + ":7051";
    }

    gossipAddress() {
        return this.address();
    }

    namespace() {
        return this.organization.namespace();
    }

    organizationName() {
        return this.organization.name();
    }

    mspID() {
        return this.organization.mspID();
    }

    addResources(writer: ResourceWriter, outputPath: string) {
        const deployment = new PeerDeployment(this, this.options);
        const service = new PeerService(this.organization.name(), this.id());

        writer.addWorkload({path: outputPath, name: this.id() + "-deployment", resource: deployment});
        writer.addResource({path: outputPath, name: this.id() + "-service", resource: service});
        writer.addResource({path: outputPath, name: this.id() + "-pvc", resource: this.persistentVolumeClaim});
    }

    addVolume(spec: IPodSpec) {
        spec.addVolume(this.volume);
    }

    mountCryptographicMaterial(container: IContainer, mountPath: string) {
        this.organization.mountPeerCryptographicMaterial(this.name(), container, mountPath);
    }

    mountCryptographicMaterialIntoVolume(container: IContainer, mountPath: string) {
        const peerSubPath = peerPathInContainer(this.name());
        this.volume.mount(container, Path.posix.join(mountPath, peerSubPath), peerSubPath);
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec) {
        this.organization.addPeerCryptographicMaterialAsVolumes(this.name(), spec);
    }

    mountTls(container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, peerTlsPathInContainer(this.name()));
    }

    mountMsp(container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, peerMspPathInContainer(this.name()));
    }

    addKubeDnsIpToArray(array: string[]): void {
        this.organization.addKubeDnsIpToArray(array);
    }

    mountChainCodes(container: IContainer, mountPath: string): void {
        this.organization.mountChainCodes(container, mountPath);
    }

    addChainCodeAsVolumes(spec: IPodSpec): void {
        this.organization.addChainCodeAsVolumes(spec);
    }
}