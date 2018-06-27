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
    private organization: Organization;
    private cryptographicMaterialVolumes: ConfigurationDirectoryTreeVolumes<ConfigMap>;
    private writer: ResourceWriter;
    private kubeDnsClusterIp: string;
    private chainCodes: IMountable[];
    private channels: IMountable[];
    private peerOrganization: UtilPeerOrganization;

    constructor(options: Options, representation: OrganizationRepresentation, kubeDnsClusterIp: string) {
        this.kubeDnsClusterIp = kubeDnsClusterIp;
        this.organization = new Organization(representation);
        this.options = options;
        this.peerOrganization = new UtilPeerOrganization(options);
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
        this.cryptographicMaterialVolumes = this.peerOrganization.createCryptographicMaterial(this.representation.path, this.namespace());
        this.cryptographicMaterialVolumes.findAndAddToWriter(this.representation.path, this.writer, this.outputPaths.configmaps);
    }

    private createChainCodes() {
        this.chainCodes = this.peerOrganization.createChainCodes(this.writer, this.namespace(), this.outputPaths.chaincodes);
    }

    private createChannels() {
        this.channels = this.peerOrganization.createChannels(this.writer, this.namespace(), this.outputPaths.channels);
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