import PeerDeployment from "./deployment";
import PeerService from "./service";
import Options from "../../../../../options";
import OrganizationEntityRepresentation from "../../../../../utilities/blockchain/representation/organizations/entities/representation";
import PeerOrganization from "../../peer";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import ConfigMapTuples from "../../../../../utilities/kubernetes/configmaptuples";
import ConfigMapTuple from "../../../../../utilities/kubernetes/configmaptuple";
import * as Path from "path";
import PersistentVolumeClaim from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import IVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import ResourceWriter from "../../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IPeer from "../../../../../utilities/blockchain/organizations/peer/entities/peer/ipeer";
import IHasResources from "../../../../../utilities/blockchain/organizations/ihasresources";

export default class Peer implements IHasResources, IPeer {
    private representation: any;
    private organization: PeerOrganization;
    private options: Options;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private volume: IVolume;

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
        this.volume = this.persistentVolumeClaim.toVolume();
    }

    private name(): string {
        return this.representation.name;
    }

    id(): string {
        return this.name().split(".")[0]; // TODO: Change this.
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

    _portOffset() {
        return parseInt((this.id().split("peer")[-1])) * 4;
    }

    addResources(writer: ResourceWriter, outputPath: string) {
        const deployment = new PeerDeployment(this, this.options);
        const service = new PeerService(this.organization.name(), this.id());

        writer.addWorkload({path: outputPath, name: this.id() + "-deployment", resource: deployment});
        writer.addResource({path: outputPath, name: this.id() + "-service", resource: service});
        writer.addResource({path: outputPath, name: this.id() + "-pvc", resource: this.persistentVolumeClaim});
    }

    addVolume(spec: IPodSpec) {
        spec.addVolume(this.volume)
    }

    mountCryptographicMaterial(container: IContainer, mountPath: string) {
        this.organization.mountPeerCryptographicMaterial(this.name(), container, mountPath);
    }

    mountCryptographicMaterialFromVolume(container: IContainer, mountPath: string) {
        const peerSubPath = Path.posix.join('peers', this.name());
        const mount = this.volume.toVolumeMount(Path.posix.join(mountPath, peerSubPath));
        mount.setSubPath(peerSubPath);
        container.addVolumeMount(mount);
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec) {
        this.organization.addPeerCryptographicMaterialAsVolumes(this.name(), spec);
    }

    mountTls(container: IContainer, mountPath: string) {
        const mount = this.volume.toVolumeMount(mountPath);
        mount.setSubPath(this.tlsPath());
        container.addVolumeMount(mount);
    }

    private tlsPath(): string {
        return Path.posix.join('peers', this.name(), 'tls');
    }

    mountMsp(container: IContainer, mountPath: string) {
        const mount = this.volume.toVolumeMount(mountPath);
        mount.setSubPath(this.mspPath());
        container.addVolumeMount(mount);
    }

    private mspPath(): string {
        return Path.posix.join('peers', this.name(), 'msp');
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