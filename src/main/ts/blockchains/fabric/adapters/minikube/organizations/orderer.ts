import * as path from 'path';
import UtilOrdererOrganization from '../../../utilities/blockchain/organizations/orderer/organization';
import Options from "../../../options";
import PersistentVolumeClaim from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import ObjectMeta from "../../../../../kubernetes-sdk/api/1.8/meta/objectmeta";
import Namespace from "../../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import Orderer from "./orderer/orderer";
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import OrganizationEntityRepresentation from "../../../utilities/blockchain/representation/organizations/entities/representation";
import * as Path from "path";
import IVolume from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import {createDirectories} from "../../../../../util";
import DirectoryOrCreateHostPathPersistentVolume from "../../../../../kubernetes-sdk/api/1.8/cluster/persistentvolumes/hostpath/directoryorcreate";
import ResourceWriter from "../../../utilities/blockchain/resourcewriter/resourcewriter";
import IOrdererOrganization from "../../../utilities/blockchain/organizations/orderer/irordererorganization";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import ConfigurationDirectoryTree from "../../../utilities/kubernetes/files/configurationdirectorytree";
import {directoryTreeToConfigMapDirectoryTree} from "../../../utilities/kubernetes/files/files";
import ConfigurationCollector from "../../../utilities/blockchain/configurationcollector";
import {
    minikubeSharedFolder,
    ordererMspPathInContainer, ordererPathInContainer,
    ordererTlsPathInContainer
} from "../../../utilities/blockchain/cryptographic/paths";
import FabricVolume from "../../../utilities/blockchain/volumes/volume";

export default class OrdererOrganization implements IOrdererOrganization {
    private options: Options;
    private representation: any;
    private configPath: string;
    private outputPaths: { root: string, orderers: string, configmaps: string };
    private persistentVolumeClaim: PersistentVolumeClaim;
    private persistentVolume: DirectoryOrCreateHostPathPersistentVolume;
    private _namespace: Namespace;
    private ordererOrganization: UtilOrdererOrganization;
    private volume: FabricVolume;
    private cryptographicMaterial: ConfigurationDirectoryTree<ConfigMap>;
    private writer: ResourceWriter;

    constructor(options: Options, representation: OrganizationRepresentation) {
        this.ordererOrganization = new UtilOrdererOrganization(options, representation);
        this.options = options;
        this.representation = representation;
        this.configPath = representation.path;
    }

    name() {
        return this.ordererOrganization.name();
    }

    namespace() {
        return this.ordererOrganization.namespace();
    }

    mspID() {
        return this.ordererOrganization.mspID()
    }

    addResources(writer: ResourceWriter) {
        this.ordererOrganization = new UtilOrdererOrganization(this.options, this.representation); //TODO; Fix this. SetVolume?
        this.ordererOrganization.addResources(writer);
        console.info('[ORDERER-ORGANISATION]:', this.ordererOrganization.name());
        this.writer = writer;
        this.configureOutput();
        this.createPersistentVolume();
        this.createConfiguration();
        this.createNamespace();
        this.createOrderers();
    }

    private configureOutput() {
        this.outputPaths = this.createOutputPaths();
        this.createOutputDirectories();
    }

    private createOutputPaths() {
        const outputPath = path.join(this.options.get('$.kubernetes.paths.ordererorganizations'), this.ordererOrganization.name());
        return {
            root: outputPath,
            orderers: path.join(outputPath, 'orderers'),
            configmaps: path.join(outputPath, 'configmaps')
        };
    }

    private createOutputDirectories() {
        console.info("Creating configuration directories");
        createDirectories([this.outputPaths.root, this.outputPaths.configmaps, this.outputPaths.orderers]);
    }

    private createPersistentVolume() {
        this.persistentVolume = new DirectoryOrCreateHostPathPersistentVolume(new ObjectMeta(this.ordererOrganization.name(), undefined));
        this.persistentVolume.setHostPath(minikubeSharedFolder(this.representation.name));
        this.persistentVolume.setCapacity({
            "storage": "50Mi"
        });
        this.persistentVolume.addAccessMode("ReadWriteOnce");
        this.persistentVolume.setStorageClassName(this.ordererOrganization.name());

        this.persistentVolumeClaim = new PersistentVolumeClaim(this.ordererOrganization.name(), this.ordererOrganization.name());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        this.persistentVolumeClaim.setStorageClassName(this.ordererOrganization.name());
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);

        this.volume = new FabricVolume(this.persistentVolumeClaim.toVolume());

        this.ordererOrganization.volume = this.volume;

        this.writer.addResource({
            path: this.outputPaths.root,
            name: this.ordererOrganization.name() + "-pv",
            resource: this.persistentVolume
        });
        this.writer.addResource({
            path: this.outputPaths.root,
            name: this.ordererOrganization.name() + "-pvc",
            resource: this.persistentVolumeClaim
        });
    }

    private createConfiguration(): void {
        this.createCryptographicMaterial();
    }

    private createCryptographicMaterial(): void {
        this.cryptographicMaterial = directoryTreeToConfigMapDirectoryTree(this.representation.path, this.namespace());
        const directories = this.cryptographicMaterial.findDirectoriesForAbsolutePath(this.representation.path);

        const cryptographicMaterialCollector = new ConfigurationCollector(directories);
        cryptographicMaterialCollector.addToWriter(this.writer, this.outputPaths.configmaps);
    }

    private createNamespace(): void {
        this._namespace = new Namespace(this.ordererOrganization.name());
        this.writer.addResource({
            path: this.outputPaths.root,
            name: this.ordererOrganization.name() + '-namespace',
            resource: this._namespace
        });
    }

    private createOrderers(): void {
        console.info("Creating orderers");
        this.representation.entities.forEach((representation: OrganizationEntityRepresentation) => {
            const orderer = new Orderer(representation, this, this.options, this.cryptographicMaterial);
            orderer.addResources(this.writer, this.outputPaths.orderers);
        });
    }

    static equalsType(type: string): boolean {
        return type === 'orderer';
    }

    mountOrdererCryptographicMaterialIntoVolume(ordererName: string, container: IContainer, mountPath: string) {
        const ordererSubPath = ordererPathInContainer(ordererName);
        this.volume.mount(container, Path.posix.join(mountPath, ordererSubPath), ordererSubPath);
    }

    addGenesisBlockAsVolume(spec: IPodSpec) {
        this.ordererOrganization.addGenesisBlockAsVolume(spec)
    }

    mountGenesisBlock(container: IContainer, mountPath: string): void {
        this.ordererOrganization.mountGenesisBlock(container, mountPath);
    }

    mountGenesisBlockDirectoryIntoVolume(container: IContainer, mountPath: string) {
        this.ordererOrganization.mountGenesisBlockDirectoryIntoVolume(container, mountPath);
    }

    mountGenesisBlockFileFromVolume(container: IContainer, mountPath: string) {
        this.ordererOrganization.mountGenesisBlockFileFromVolume(container, mountPath);
    }

    addOrganizationVolumeToPodSpec(spec: IPodSpec) {
        this.ordererOrganization.addOrganizationVolumeToPodSpec(spec);
    }

    mountOrdererMspFromVolume(ordererName: string, container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, ordererMspPathInContainer(ordererName));
    }

    mountOrdererTlsFromVolume(ordererName: string, container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, ordererTlsPathInContainer(ordererName));
    }
}