import * as Path from "path";
import Options from "../../../options";
import Namespace from "../../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import CertificateAuthority from "./peer/ca/ca";
import CommandLineInterFace from "./peer/cli/cli";
import Peer from "./peer/peer/peer";
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import OrganizationEntityRepresentation from "../../../utilities/blockchain/representation/organizations/entities/representation";
import {createDirectories} from "../../../../../util";
import ResourceWriter from "../../../utilities/blockchain/resourcewriter/resourcewriter";
import {directoryTreeToConfigMapDirectoryTree} from "../../../utilities/kubernetes/files/files";
import ChainCodeOptions from "../../../utilities/blockchain/chaincode/options";
import Channel from "../../../utilities/blockchain/channel/channel";
import ChannelOptions from "../../../utilities/blockchain/channel/options";
import ChainCode from "../../../utilities/blockchain/chaincode/chaincode";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IChainCodeCollector from "../../../utilities/blockchain/chaincode/ichainccodecollector";
import IChannelCollector from "../../../utilities/blockchain/channel/ichannelcollector";
import {
    caPathOnHost, peerAdminMspPathOnHost, peerPathOnHost
} from "../../../utilities/blockchain/cryptographic/paths";
import Organization from "../../../utilities/blockchain/organizations/organization";
import IOrganization from "../../../utilities/blockchain/organizations/iorganization";
import ConfigurationDirectoryTreeVolumes from "../../../utilities/blockchain/volumes/configurationdirectorytreevolumes";

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
    private organization: Organization;
    private cryptographicMaterialVolumes: ConfigurationDirectoryTreeVolumes<ConfigMap>;
    private writer: ResourceWriter;
    private kubeDnsClusterIp: string;
    private chainCodes: ChainCode[];
    private channels: Channel[];

    constructor(options: Options, representation: OrganizationRepresentation, kubeDnsClusterIp: string) {
        this.kubeDnsClusterIp = kubeDnsClusterIp;
        this.organization = new Organization(representation);
        this.options = options;
        this.representation = representation;
        this.configPath = representation.path;
        this.outputPaths = this.createOutputPaths();
        this.chainCodes = [];
        this.channels = [];
    }

    private createOutputPaths(): OutputPaths {
        const outputPath = Path.join(this.options.get('$.kubernetes.paths.peerorganizations'), this.name());
        return {
            root: outputPath,
            peers: Path.join(outputPath, 'peers'),
            configmaps: Path.join(outputPath, 'crypto'),
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

    private async createConfiguration() {
        this.createCryptoMaterial();
        this.createChainCodes();
        this.createChannels();
    }

    private createCryptoMaterial() {
        const cryptographicMaterial = directoryTreeToConfigMapDirectoryTree(this.representation.path, this.namespace());
        this.cryptographicMaterialVolumes = new ConfigurationDirectoryTreeVolumes(cryptographicMaterial);
        this.cryptographicMaterialVolumes.findAndAddToWriter(this.representation.path, this.writer, this.outputPaths.configmaps)
    }

    private createChainCodes() {
        const chaincodes = this.options.get('$.options.chaincodes');
        chaincodes.forEach((chainCodeOptions: ChainCodeOptions) => {
            chainCodeOptions.path = chainCodeOptions.path || Path.join(this.options.get('$.blockchain.paths.chaincodes'), chainCodeOptions.id);
            const chainCode = new ChainCode(chainCodeOptions, this.namespace());
            chainCode.addToWriter(this.writer, Path.join(this.outputPaths.chaincodes, chainCodeOptions.id));
            this.chainCodes.push(chainCode);
        });
    }

    private createChannels() {
        const channels = this.options.get('$.options.channels') || [];
        channels.forEach((channelOptions: ChannelOptions) => {
            channelOptions.path = channelOptions.path || Path.join(this.options.get('$.blockchain.paths.channels'), channelOptions.name);
            const channel = new Channel(channelOptions, this.namespace());
            channel.addToWriter(this.writer, Path.join(this.outputPaths.channels, channelOptions.name));
            this.channels.push(channel);
        });
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
        this.cryptographicMaterialVolumes.findAndAddAsVolumes(caPathOnHost(), spec);
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

    addPeerCryptographicMaterialAsVolumes(peerName: string, spec: IPodSpec) {
        this.cryptographicMaterialVolumes.findAndAddAsVolumes(peerPathOnHost(peerName), spec);
    }

    mountChainCodes(container: IContainer, mountPath: string): void {
        this.chainCodes.forEach((chainCode) => {
            chainCode.mount(container, mountPath);
        });
    }

    addChainCodeAsVolumes(spec: IPodSpec): void {
        this.chainCodes.forEach((chainCode) => {
            chainCode.addAsVolume(spec);
        });
    }

    mountChannels(container: IContainer, mountPath: string): void {
        this.channels.forEach((channel: Channel) => {
            channel.mount(container, mountPath);
        })
    }

    addChannelsAsVolumes(spec: IPodSpec): void {
        this.channels.forEach((channel: Channel) => {
            channel.addAsVolume(spec);
        })
    }
}