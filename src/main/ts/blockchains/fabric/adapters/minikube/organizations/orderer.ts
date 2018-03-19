import IOrganization from "./iorganization";
import * as path from 'path';
import Organization from './organization';
import Options from "../../../options";
import PersistentVolumeClaim from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import ObjectMeta from "../../../../../kubernetes-sdk/api/1.8/meta/objectmeta";
import OpaqueSecret from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/secret/opaquesecret";
import Namespace from "../../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import Orderer from "./orderer/orderer";
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import OrganizationEntityRepresentation from "../../../utilities/blockchain/representation/organizations/entities/representation";
import * as Path from "path";
import IVolume from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import ConfigMapTuples from "../../../utilities/kubernetes/configmaptuples";
import ConfigMapTuple from "../../../utilities/kubernetes/configmaptuple";
import {createDirectories, toJsonFile} from "../../../../../util";
import {directoryTreeToConfigMapTuples} from "../../../utilities/kubernetes/configmap";
import {directoryToOpaqueSecret} from "../../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/secret";
import DirectoryOrCreateHostPathPersistentVolume from "../../../../../kubernetes-sdk/api/1.8/cluster/persistentvolumes/hostpath/directoryorcreate";
import Container from "../../../../../kubernetes-sdk/api/1.8/workloads/container/container";

export default class OrdererOrganization implements IOrganization {
    private options: Options;
    private representation: any;
    private configPath: string;
    private outputPaths: { root: string, orderers: string, configmaps: string };
    private persistentVolumeClaim: PersistentVolumeClaim;
    private persistentVolume: DirectoryOrCreateHostPathPersistentVolume;
    private genesisBlockSecret: OpaqueSecret;
    private _namespace: Namespace;
    private organization: Organization;
    private volume: IVolume;
    private configMapTuples: ConfigMapTuples;

    constructor(options: Options, representation: OrganizationRepresentation) {
        this.organization = new Organization(representation, options);
        this.options = options;
        this.representation = representation;
        this.configPath = representation.path;
        this.outputPaths = this.createOutputPaths();
    }

    private createOutputPaths() {
        const outputPath = path.join(this.options.get('$.kubernetes.paths.ordererorganizations'), this.organization.name());
        return {
            root: outputPath,
            orderers: path.join(outputPath, 'orderers'),
            configmaps: path.join(outputPath, 'configmaps')
        };
    }

    private createPersistentVolume() {
        this.persistentVolume = new DirectoryOrCreateHostPathPersistentVolume(new ObjectMeta(this.organization.name(), undefined));
        this.persistentVolume.setHostPath(this.organization.minikubeSharedFolder());
        this.persistentVolume.setCapacity({
            "storage": "50Mi"
        });
        this.persistentVolume.addAccessMode("ReadWriteOnce");
        this.persistentVolume.setStorageClassName(this.organization.name());

        this.persistentVolumeClaim = new PersistentVolumeClaim(this.organization.name(), this.organization.name());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        this.persistentVolumeClaim.setStorageClassName(this.organization.name());
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);

        this.volume = this.persistentVolumeClaim.toVolume();

        toJsonFile(this.outputPaths.root, this.organization.name() + "-pv", this.persistentVolume.toJson());
        toJsonFile(this.outputPaths.root, this.organization.name() + "-pvc", this.persistentVolumeClaim.toJson());
    }

    private createGenesisBlockSecret(configPath: string) {
        this.genesisBlockSecret = directoryToOpaqueSecret(configPath, this.organization.name() + '-genesis-block', this.namespace());
        toJsonFile(this.outputPaths.root, this.organization.name() + '-genesis-block', this.genesisBlockSecret.toJson())
    }

    name() {
        return this.organization.name();
    }

    namespace() {
        return this.organization.namespace();
    }

    mspID() {
        return this.organization.mspID()
    }

    addressSegment() {
        return this.organization.addressSegment();
    }

    createKubernetesResources() {
        console.info('[ORDERER-ORGANISATION]:', this.organization.name());
        this.createOutputDirectories();
        this.createPersistentVolume();
        this.createGenesisBlockSecret(this.configPath);
        this.createConfigMapTuples();
        this.createNamespace();
        this.createOrderers();
    }

    private createConfigMapTuples(): void {
        this.configMapTuples = directoryTreeToConfigMapTuples(this.representation.path, this.namespace());
        const tuples = this.configMapTuples.findForAbsolutePath(this.representation.path);
        tuples.forEach((tuple: ConfigMapTuple) => {
            const json = tuple.getConfigMap().toJson();
            const name = json.metadata.name; //TODO: Change this. Ok for now.
            toJsonFile(this.outputPaths.configmaps, name, json);
        })
    }

    private createNamespace() {
        this._namespace = new Namespace(this.organization.name());
        toJsonFile(this.outputPaths.root, this.organization.name() + '-namespace', this._namespace.toJson());
    }

    private createOutputDirectories() {
        console.info("Creating configuration directories");
        createDirectories([this.outputPaths.root, this.outputPaths.configmaps, this.outputPaths.orderers]);
    }

    private createOrderers() {
        console.info("Creating orderers");
        this.representation.entities.forEach((representation: OrganizationEntityRepresentation) => {
            const orderer = new Orderer(representation, this, this.options);
            orderer.toKubernetesResource(this.outputPaths.orderers);
        });
    }

    static equalsType(type: string) {
        return type === 'orderer';
    }

    addOrdererConfigurationToContainer(ordererName: string, container: IContainer, baseMountPath: string) {
        const relativePath = Path.join('orderers', ordererName);
        const tuples = this.configMapTuples.findSubPathTuplesForRelativePath(relativePath);

        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsRelativeVolumeMount(container, baseMountPath);
        });
    }

    addOrdererConfigurationAsVolume(ordererName: string, spec: IPodSpec) {
        const relativePath = Path.join('orderers', ordererName);
        const tuples = this.configMapTuples.findSubPathTuplesForRelativePath(relativePath);

        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolume(spec)
        });
    }

    addOrdererConfigurationToOrganizationVolume(ordererName: string, container: IContainer, mountPath: string) {
        const peerSubPath = Path.posix.join('orderers', ordererName);
        const mount = this.volume.toVolumeMount(Path.posix.join(mountPath, peerSubPath));
        mount.setSubPath(peerSubPath);
        container.addVolumeMount(mount);
    }

    addGenesisBlockAsVolume(spec: IPodSpec) {
        const genesisBlockVolume = this.genesisBlockSecret.toVolume();
        spec.addVolume(genesisBlockVolume);
    }

    addGenesisBlockVolumeToContainer(container: IContainer, mountPath: string) {
        container.addVolumeMount(this.genesisBlockSecret.toVolume().toVolumeMount(Path.posix.join(mountPath, 'genesis')));
    }

    addGenesisBlockToContainer(container: IContainer, mountPath: string) {
        const genesisBlockVolumeMount = this.volume.toVolumeMount(mountPath);
        genesisBlockVolumeMount.setSubPath(Path.posix.join('genesis', 'genesis.block'));
        container.addVolumeMount(genesisBlockVolumeMount);
    }

    addGenesisBlockToOrganizationVolume(container: IContainer, mountPath: string) {
        const genesisBlockVolumeMount = this.volume.toVolumeMount(mountPath);
        genesisBlockVolumeMount.setSubPath(Path.posix.join('genesis'));
        container.addVolumeMount(genesisBlockVolumeMount);
    }

    addOrdererMspToContainer(ordererName: string, container: IContainer, mountPath: string) {
        const mspVolumeMount = this.volume.toVolumeMount(mountPath);
        mspVolumeMount.setSubPath(this.mspPath(ordererName));
        container.addVolumeMount(mspVolumeMount);
    }

    private mspPath(ordererName: string): string {
        return Path.posix.join('orderers', ordererName, 'msp');
    }

    addOrdererTlsToContainer(ordererName: string, container: IContainer, tlsMountPath: string) {
        const tlsVolumeMount = this.volume.toVolumeMount(tlsMountPath);
        tlsVolumeMount.setSubPath(this.tlsPath(ordererName));
        container.addVolumeMount(tlsVolumeMount);
    }

    private tlsPath(ordererName: string): string {
        return Path.posix.join('orderers', ordererName, 'tls');
    }

    addOrganizationVolumeToPodSpec(spec: IPodSpec) {
        spec.addVolume(this.volume);
    }
}