import IOrdererOrganization from "./irordererorganization";
import * as Path from "path";
import IPodSpec from "../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import ResourceWriter from "../../resourcewriter/resourcewriter";
import IVolume from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import OrganizationRepresentation from "../../representation/organizations/representation";
import Options from "../../../../options";
import {directoryToOpaqueSecret} from "../../../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/secret";
import OpaqueSecret from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/secret/opaquesecret";
import * as path from "path";
import {createDirectories} from "../../../../../../util";
import Organization from "../organization";
import {directoryTreeToConfigMapDirectoryTree} from "../../../kubernetes/files/files";
import ConfigurationCollector from "../../configurationcollector";
import ConfigMap from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import ConfigurationDirectoryTree from "../../../kubernetes/files/configurationdirectorytree";


interface OutputPaths {
    root: string;
    orderers: string;
    configmaps: string;
}

export default class OrdererOrganization implements IOrdererOrganization {
    private genesisBlockSecret: OpaqueSecret;
    private _volume: IVolume;
    private organization: Organization;
    private writer: ResourceWriter;
    private outputPaths: OutputPaths;
    private cryptographicMaterial: ConfigurationDirectoryTree<ConfigMap>;
    private representation: OrganizationRepresentation;
    private options: Options;

    constructor(options: Options, representation: OrganizationRepresentation) {
        this.options = options;
        this.representation = representation;
        this.organization = new Organization(representation);
    }

    name(): string {
        return this.organization.name();
    }

    namespace(): string {
        return this.organization.namespace();
    }

    mspID(): string {
        return this.organization.mspID();
    }

    set volume(value: IVolume) {
        this._volume = value;
    }

    addResources(writer: ResourceWriter): void {
        this.writer = writer;
        this.configureOutput();
        this.createConfiguration();
    }


    private configureOutput() {
        this.outputPaths = this.createOutputPaths();
        this.createOutputDirectories();
    }

    private createOutputPaths(): OutputPaths {
        const outputPath = path.join(this.options.get('$.kubernetes.paths.ordererorganizations'), this.organization.name());
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

    private createConfiguration() {
        this.createGenesisBlockSecret();
        this.createCryptographicMaterial();
    }

    private createGenesisBlockSecret() {
        this.genesisBlockSecret = directoryToOpaqueSecret(this.representation.path, this.name() + '-genesis-block', this.namespace());
        this.writer.addResource({
            path: this.outputPaths.root, //TODO: Fix this.
            name: this.organization.name() + "-genesis-block-secret",
            resource: this.genesisBlockSecret
        })
    }

    private createCryptographicMaterial(): void {
        this.cryptographicMaterial = directoryTreeToConfigMapDirectoryTree(this.representation.path, this.namespace());
        const directories = this.cryptographicMaterial.findDirectoriesForAbsolutePath(this.representation.path);

        const cryptographicMaterialCollector = new ConfigurationCollector(directories);
        cryptographicMaterialCollector.addToWriter(this.writer, this.outputPaths.configmaps);
    }

    addGenesisBlockAsVolume(spec: IPodSpec) {
        const genesisBlockVolume = this.genesisBlockSecret.toVolume();
        spec.addVolume(genesisBlockVolume);
    }

    mountGenesisBlock(container: IContainer, mountPath: string) {
        container.addVolumeMount(this.genesisBlockSecret.toVolume().toVolumeMount(Path.posix.join(mountPath, 'genesis')));
    }

    mountGenesisBlockDirectoryIntoVolume(container: IContainer, mountPath: string) {
        const genesisBlockVolumeMount = this._volume.toVolumeMount(mountPath);
        genesisBlockVolumeMount.setSubPath(Path.posix.join('genesis'));
        container.addVolumeMount(genesisBlockVolumeMount);
    }

    mountGenesisBlockFileFromVolume(container: IContainer, mountPath: string) {
        const genesisBlockVolumeMount = this._volume.toVolumeMount(mountPath);
        genesisBlockVolumeMount.setSubPath(Path.posix.join('genesis', 'genesis.block'));
        container.addVolumeMount(genesisBlockVolumeMount);
    }

    addOrganizationVolumeToPodSpec(spec: IPodSpec) {
        spec.addVolume(this._volume);
    }
}