import * as Path from 'path';
import IOrganization from "./iorganization";
import Options from "../../../options";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import Organization from "./organization";
import Namespace from "../../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import PersistentVolumeClaim from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import CertificateAuthority from "./peer/ca/ca";
import CommandLineInterFace from "./peer/cli/cli";
import Peer from "./peer/peer/peer";
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import OrganizationEntityRepresentation from "../../../utilities/blockchain/representation/organizations/entities/representation";
import ObjectMeta from "../../../../../kubernetes-sdk/api/1.8/meta/objectmeta";
import ConfigMapTuples from "../../../utilities/kubernetes/configmaptuples";
import {createDirectories, toJsonFile} from "../../../../../util";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IVolume from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import ConfigMapTuple from "../../../utilities/kubernetes/configmaptuple";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import {directoryTreeToConfigMapTuples} from "../../../utilities/kubernetes/configmap";
import DirectoryOrCreateHostPathPersistentVolume from "../../../../../kubernetes-sdk/api/1.8/cluster/persistentvolumes/hostpath/directoryorcreate";

export default class PeerOrganization implements IOrganization {
    private options: Options;
    private representation: any;
    private configPath: string;
    private outputPaths: { root: string; peers: string; configmaps: string };
    private persistentVolume: DirectoryOrCreateHostPathPersistentVolume;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private organization: Organization;
    private configMapTuples: ConfigMapTuples;
    private volume: IVolume;

    constructor(options: Options, representation: OrganizationRepresentation) {
        this.organization = new Organization(representation, options);
        this.options = options;
        this.representation = representation;
        this.configPath = representation.path;
        this.outputPaths = this.createOutputPaths();
    }

    private createOutputPaths() {
        const outputPath = Path.join(this.options.get('$.kubernetes.paths.peerorganizations'), this.name());
        return {
            root: outputPath,
            peers: Path.join(outputPath, 'peers'),
            configmaps: Path.join(outputPath, 'configmaps')
        };
    }

    name() {
        return this.organization.name();
    }

    namespace() {
        return this.organization.namespace();
    }

    addressSegment() {
        return this.organization.addressSegment();
    }

    mspID() {
        return this.organization.mspID();
    }

    createKubernetesResources() {
        console.info("[PEER-ORGANISATION]:", this.name());
        this.createOrganisationDirectories();
        this.createConfigMapTuples();
        this.createNamespace();
        this.createPersistentVolume();
        this.createCli();
        this.createCa();
        this.createPeers();
    }

    private createOrganisationDirectories() {
        console.info("Creating configuration directories");
        createDirectories([this.outputPaths.peers, this.outputPaths.configmaps]);
    }

    private createConfigMapTuples(): void {
        this.configMapTuples = directoryTreeToConfigMapTuples(this.representation.path, this.namespace());
        const tuples = this.configMapTuples.findForAbsolutePath(this.configPath);
        tuples.forEach((tuple: ConfigMapTuple) => {
            const json = tuple.getConfigMap().toJson();
            const name = json.metadata.name; //TODO: Change this. Ok for now.
            toJsonFile(this.outputPaths.configmaps, name, json);
        })
    }

    private createNamespace() {
        const outputPath = this.outputPaths.root;
        const namespace = new Namespace(this.name());
        toJsonFile(outputPath, this.name() + '-namespace', namespace.toJson());
    }

    private createPersistentVolume() {
        //TODO: PersistentHostPathVolume should be changed when creating configuration for AWS.
        this.persistentVolume = new DirectoryOrCreateHostPathPersistentVolume(new ObjectMeta(this.name(), undefined));
        this.persistentVolume.setHostPath(this.organization.minikubeSharedFolder());
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
        this.volume = this.persistentVolumeClaim.toVolume();

        toJsonFile(this.outputPaths.root, this.name() + "-pv", this.persistentVolume.toJson());
        toJsonFile(this.outputPaths.root, this.name() + "-pvc", this.persistentVolumeClaim.toJson());
    }

    private createCli() {
        const cli = new CommandLineInterFace(this, this.name(), this.options);
        cli.toKubernetesResource(this.outputPaths.root);
    }

    private createCa() {
        const ca = new CertificateAuthority(this, this.representation.certificateAuthority, this.options);
        ca.toKubernetesResource(this.outputPaths.root);
    }

    private createPeers() {
        console.info("Creating peers");
        this.representation.entities.map((representation: OrganizationEntityRepresentation) => {
            const peer = new Peer(representation, this, this.options);
            peer.toKubernetesResource(this.outputPaths.peers);
        });
    }

    static equalsType(type: string) {
        return type === 'peer';
    }

    addCertificateAuthorityConfigurationToContainer(container: IContainer, mountPath: string) {
        const tuples = this.configMapTuples.findTuplesForRelativePath(this.hostCaPath());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolumeMount(container, mountPath);
        });
    }

    addCertificateAuthorityConfigurationAsVolumes(spec: IPodSpec) {
        const tuples = this.configMapTuples.findTuplesForRelativePath(this.hostCaPath());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolume(spec);
        });
    }

    private hostCaPath() {
        return 'ca';
    }

    private caPath() {
        return Path.posix.join('ca', Path.posix.sep);
    }

    addCertificateAuthorityConfigurationFromVolume(container: IContainer, mountPath: string) {
        const volumeMount = this.volume.toVolumeMount(mountPath);
        volumeMount.setSubPath(this.caPath());
        container.addVolumeMount(volumeMount);
    }

    addCliMspConfigurationToContainer(container: IContainer, mountPath: string) {
        const toVolumeMount = this.volume.toVolumeMount(mountPath);
        toVolumeMount.setSubPath(this.peerMspPath());
        container.addVolumeMount(toVolumeMount);
    }

    private peerMspPath() {
        return Path.posix.join('users', `Admin@${this.organization.name()}`, 'msp');
    }

    addPeerAdminConfigurationToContainer(container: IContainer, baseMountPath: string) {
        const tuples = this.configMapTuples.findTuplesForRelativePath(this.peerAdminPath());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolumeMount(container, baseMountPath);
        });
    }

    addPeerAdminConfigurationAsVolumes(deployment: IPodSpec) {
        const tuples = this.configMapTuples.findTuplesForRelativePath(this.peerAdminPath());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolume(deployment);
        });
    }

    private peerAdminPath(): string {
        return Path.join('users', `Admin@${this.organization.name()}`, 'msp');
    }

    addPeerConfigurationToContainer(peerName: string, container: IContainer, mountPath: string) {
        const relativePath = Path.join('peers', peerName);
        const tuples = this.configMapTuples.findSubPathTuplesForRelativePath(relativePath);
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsRelativeVolumeMount(container, mountPath);
        })
    }

    addPeerConfigurationToOrganizationVolume(peerName: string, container: IContainer, mountPath: string) {
        const peerSubPath = Path.posix.join('peers', peerName);
        const mount = this.volume.toVolumeMount(Path.posix.join(mountPath, peerSubPath));
        mount.setSubPath(peerSubPath);
        container.addVolumeMount(mount);
    }

    addPeerConfigurationAsVolumes(peerName: string, spec: IPodSpec) {
        const relativepath = Path.join('peers', peerName);
        const tuples = this.configMapTuples.findSubPathTuplesForRelativePath(relativepath);
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolume(spec);
        });
    }

    addPeerTlsToContainer(peerName: string, container: IContainer, mountPath: string) {
        const mount = this.volume.toVolumeMount(mountPath);
        mount.setSubPath(this.tlsPath(peerName));
        container.addVolumeMount(mount);
    }

    private tlsPath(peerName: string): string {
        return Path.posix.join('peers', peerName, 'tls');
    }

    addPeerMspToContainer(peerName: string, container: IContainer, mountPath: string) {
        const mount = this.volume.toVolumeMount(mountPath);
        mount.setSubPath(this.mspPath(peerName));
        container.addVolumeMount(mount);
    }

    private mspPath(peerName: string): string {
        return Path.posix.join('peers', peerName, 'msp');
    }

    addOrganizationVolumeToPodSpec(spec: IPodSpec) {
        spec.addVolume(this.volume)
    }

}