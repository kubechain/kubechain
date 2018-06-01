import * as path from 'path';
import UtilOrdererOrganization from '../../../utilities/blockchain/organizations/orderer/organization';
import Options from "../../../options";
import Namespace from "../../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import Orderer from "./orderer/orderer";
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import OrganizationEntityRepresentation from "../../../utilities/blockchain/representation/organizations/entities/representation";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import {createDirectories} from "../../../../../util";
import ResourceWriter from "../../../utilities/blockchain/resourcewriter/resourcewriter";
import IOrdererOrganization from "../../../utilities/blockchain/organizations/orderer/irordererorganization";
import {directoryTreeToConfigMapDirectoryTree} from "../../../utilities/kubernetes/files/files";
import ConfigurationDirectoryTree from "../../../utilities/kubernetes/files/configurationdirectorytree";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import ConfigurationCollector from "../../../utilities/blockchain/configurationcollector";

export default class OrdererOrganization implements IOrdererOrganization {
    private options: Options;
    private representation: any;
    private configPath: string;
    private outputPaths: { root: string, orderers: string, configmaps: string };
    private _namespace: Namespace;
    private ordererOrganization: UtilOrdererOrganization;
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

    mountGenesisBlock(container: IContainer, mountPath: string): void {
        this.ordererOrganization.mountGenesisBlock(container, mountPath);
    }

    addGenesisBlockAsVolume(spec: IPodSpec) {
        this.ordererOrganization.addGenesisBlockAsVolume(spec)
    }

    mountGenesisBlockDirectoryIntoVolume(container: IContainer, mountPath: string) {
    }

    mountGenesisBlockFileFromVolume(container: IContainer, mountPath: string): void {
    }
}