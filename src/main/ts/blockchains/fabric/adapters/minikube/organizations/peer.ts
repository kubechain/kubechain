import * as Path from "path";
import Options from "../../../options";
import Namespace from "../../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import PersistentVolumeClaim from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import CertificateAuthority from "./peer/ca/ca";
import CommandLineInterFace from "./peer/cli/cli";
import Peer from "./peer/peer/peer";
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import OrganizationEntityRepresentation from "../../../utilities/blockchain/representation/organizations/entities/representation";
import ObjectMeta from "../../../../../kubernetes-sdk/api/1.8/meta/objectmeta";
import {createDirectories} from "../../../../../util";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import DirectoryOrCreateHostPathPersistentVolume from "../../../../../kubernetes-sdk/api/1.8/cluster/persistentvolumes/hostpath/directoryorcreate";
import ResourceWriter from "../../../utilities/blockchain/resourcewriter/resourcewriter";
import IChainCodeCollector from "../../../utilities/blockchain/chaincode/ichainccodecollector";
import IChannelCollector from "../../../utilities/blockchain/channel/ichannelcollector";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import {
    caPathInContainer, caPathOnHost, peerMspPathInContainer,
    peerAdminMspPathInContainer, peerAdminMspPathOnHost, peerTlsPathInContainer, minikubeSharedFolder, peerPathOnHost,
    peerPathInContainer
} from "../../../utilities/blockchain/cryptographic/paths";
import Organization from "../../../utilities/blockchain/organizations/organization";
import IOrganization from "../../../utilities/blockchain/organizations/iorganization";
import ConfigurationDirectoryTreeVolumes from "../../../utilities/blockchain/volumes/configurationdirectorytreevolumes";
import FabricVolume from "../../../utilities/blockchain/volumes/volume";
import FabricHooks from "../../../utilities/blockchain/hooks";
import UtilPeerOrganization from "../../../utilities/blockchain/organizations/peer/organization";
import IMountable from "../../../utilities/blockchain/mountable";

interface OutputPaths {
    channels: string;
    root: string;
    peers: string;
    configmaps: string;
    chaincodes: string;
}

export default class PeerOrganization implements IOrganization, IChainCodeCollector, IChannelCollector {
    private options: Options;
    private representation: any;
    private configPath: string;
    private outputPaths: OutputPaths;
    private persistentVolume: DirectoryOrCreateHostPathPersistentVolume;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private organization: Organization;
    private cryptographicMaterialVolumes: ConfigurationDirectoryTreeVolumes<ConfigMap>;
    private volume: FabricVolume;
    private writer: ResourceWriter;
    private kubeDnsClusterIp: string;
    private chainCodes: IMountable[];
    private channels: IMountable[];
    private hooks: FabricHooks;
    private peerOrganization: UtilPeerOrganization;

    constructor(options: Options, representation: OrganizationRepresentation, kubeDnsClusterIp: string) {
        this.kubeDnsClusterIp = kubeDnsClusterIp;
        this.organization = new Organization(representation);
        this.options = options;
        this.hooks = this.options.get('$.hooks');
        this.peerOrganization = new UtilPeerOrganization(this.options);
        this.representation = representation;
        this.configPath = representation.path;
        this.outputPaths = this.initializeOutputPaths();
        this.chainCodes = [];
        this.channels = [];
    }

    private initializeOutputPaths(): OutputPaths {
        const outputPath = Path.join(this.options.get('$.kubernetes.paths.peerorganizations'), this.name());
        return {
            root: outputPath,
            peers: Path.join(outputPath, 'peers'),
            configmaps: Path.join(outputPath, 'crypto'), //TODO: Check this.
            chaincodes: Path.join(outputPath, 'chaincodes'),
            channels: Path.join(outputPath, 'channels')
        };
    }

    name() {
        return this.organization.name();
    }

    namespace() {
        return this.organization.namespace();
    }

    mspID() {
        return this.organization.mspID();
    }

    async addResources(writer: ResourceWriter) {
        console.info("[PEER-ORGANISATION]:", this.name());
        this.writer = writer;
        this.createOrganisationDirectories();
        this.createPersistentVolume();
        await this.createConfiguration();
        this.createNamespace();
        this.createCli();
        this.createCa();
        this.createPeers();
        return Promise.resolve();
    }

    private createOrganisationDirectories() {
        console.info("Creating configuration directories");
        createDirectories([this.outputPaths.peers, this.outputPaths.configmaps]);
    }

    private createPersistentVolume() {
        this.persistentVolume = new DirectoryOrCreateHostPathPersistentVolume(new ObjectMeta(this.name(), undefined));
        this.persistentVolume.setHostPath(minikubeSharedFolder(this.organization.name()));
        this.persistentVolume.setCapacity({
            "storage": "50Mi"
        });
        this.persistentVolume.setStorageClassName(this.name());
        this.persistentVolume.addAccessMode("ReadWriteOnce");

        this.persistentVolumeClaim = new PersistentVolumeClaim(this.name(), this.name());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        this.persistentVolumeClaim.setStorageClassName(this.name());
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);

        this.writer.addResource({
            path: this.outputPaths.root,
            name: this.name() + "-pv",
            resource: this.persistentVolume
        });
        this.writer.addResource({
            path: this.outputPaths.root,
            name: this.name() + "-pvc",
            resource: this.persistentVolumeClaim
        });

        this.volume = new FabricVolume(this.persistentVolumeClaim.toVolume());
    }

    private async createConfiguration() {
        this.createCryptoMaterial();
        this.createChannels();
        this.createChainCodes();
    }

    private createCryptoMaterial() {
        this.cryptographicMaterialVolumes = this.peerOrganization.createCryptographicMaterial(this.representation.path, this.namespace());
        this.cryptographicMaterialVolumes.findAndAddToWriter(this.representation.path, this.writer, this.outputPaths.configmaps);

        this.hooks.createdCryptographicMaterial({
            name: this.name(),
            domain: this.namespace(),
            cryptographicMaterial: this.cryptographicMaterialVolumes
        });
    }

    private createChannels() {
        this.channels = this.peerOrganization.createChannels(this.writer, this.namespace(), this.outputPaths.channels);

        this.hooks.createdChannels({
            name: this.name(),
            domain: this.namespace(),
            channels: this.channels
        });
    }

    private createChainCodes() {
        this.chainCodes = this.peerOrganization.createChainCodes(this.writer, this.namespace(), this.outputPaths.chaincodes);
    }

    private createNamespace() {
        const namespace = new Namespace(this.name());
        this.writer.addResource({
            path: this.outputPaths.root,
            name: this.name() + '-namespace',
            resource: namespace
        });
    }

    private createCli() {
        const cli = new CommandLineInterFace(this, this.name(), this.options);
        cli.addResources(this.writer, this.outputPaths.root);
    }

    private createCa() {
        const ca = new CertificateAuthority(this, this.representation.certificateAuthority, this.options);
        ca.addResources(this.writer, this.outputPaths.root);
    }

    private createPeers() {
        console.info("Creating peers");
        this.representation.entities.map((representation: OrganizationEntityRepresentation) => {
            const peer = new Peer(representation, this, this.options);
            peer.addResources(this.writer, this.outputPaths.peers);
        });
    }

    addKubeDnsIpToArray(dns: string[]) {
        dns.push(this.kubeDnsClusterIp);
    }

    static equalsType(type: string) {
        return type === 'peer';
    }

    mountCertificateAuthorityCryptographicMaterial(container: IContainer, mountPath: string) {
        this.cryptographicMaterialVolumes.findAndMount(caPathOnHost(), container, mountPath);
    }

    addCertificateAuthorityCryptographicMaterialAsVolumes(spec: IPodSpec) {
        this.cryptographicMaterialVolumes.findAndAddAsVolumes(caPathOnHost(), spec)
    }

    mountCertificateAuthorityCryptographicMaterialFromVolume(container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, caPathInContainer())
    }

    mountCliMspCryptographicMaterialFromVolume(container: IContainer, mountPath: string) {
        this.volume.mount(container, Path.posix.join(mountPath, peerAdminMspPathInContainer(this.organization.name())), peerAdminMspPathInContainer(this.organization.name()))
    }

    mountCliMspCryptographicMaterial(container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, peerAdminMspPathInContainer(this.organization.name()));
    }

    mountPeerAdminCryptographicMaterial(container: IContainer, mountPath: string) {
        this.cryptographicMaterialVolumes.findAndMount(peerAdminMspPathOnHost(this.organization.name()), container, mountPath);
    }

    addPeerAdminConfigurationAsVolumes(spec: IPodSpec) {
        this.cryptographicMaterialVolumes.findAndAddAsVolumes(peerAdminMspPathOnHost(this.organization.name()), spec);
    }

    mountPeerCryptographicMaterial(peerName: string, container: IContainer, mountPath: string) {
        this.cryptographicMaterialVolumes.findAndMount(peerPathOnHost(peerName), container, mountPath);
    }

    mountPeerCryptographicMaterialFromOrganizationVolume(peerName: string, container: IContainer, mountPath: string) {
        const peerSubPath = peerPathInContainer(peerName);
        this.volume.mount(container, Path.posix.join(mountPath, peerSubPath), peerSubPath);
    }

    addPeerCryptographicMaterialAsVolumes(peerName: string, spec: IPodSpec) {
        this.cryptographicMaterialVolumes.findAndAddAsVolumes(peerPathOnHost(peerName), spec);
    }

    mountPeerTls(peerName: string, container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, peerTlsPathInContainer(peerName));
    }

    mountPeerMsp(peerName: string, container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, peerMspPathInContainer(peerName));
    }

    addVolumeToPodSpec(spec: IPodSpec) {
        spec.addVolume(this.volume)
    }

    mountChainCodes(container: IContainer, mountPath: string): void {
        this.peerOrganization.mountMountables(this.chainCodes, container, mountPath);
    }

    addChainCodeAsVolumes(spec: IPodSpec): void {
        this.peerOrganization.addMountablesAsVolumes(this.chainCodes, spec);
    }

    mountChannels(container: IContainer, mountPath: string): void {
        this.peerOrganization.mountMountables(this.channels, container, mountPath);
    }

    addChannelsAsVolumes(spec: IPodSpec): void {
        this.peerOrganization.addMountablesAsVolumes(this.channels, spec);
    }
}