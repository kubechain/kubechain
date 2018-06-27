import Options from "../../../../options";
import OrganizationEntityRepresentation from "../../../../utilities/blockchain/representation/organizations/entities/representation";
import OrdererOrganization from "../orderer";
import ResourceWriter from "../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IPodSpec from "../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IOrderer from "../../../../utilities/blockchain/organizations/orderer/entities/orderer/iorderer";
import ConfigurationDirectoryTree from "../../../../utilities/kubernetes/directorytree/configurationdirectorytree";
import ConfigMap from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import {
    ordererPathOnHost,
} from "../../../../utilities/blockchain/cryptographic/paths";
import {identifier} from "../../../../utilities/blockchain/organizations/identifiers";
import OrdererDeployment from "../../../../utilities/blockchain/organizations/orderer/entities/orderer/deployment";
import OrdererService from "../../../../utilities/blockchain/organizations/orderer/entities/orderer/service";
import ConfigurationDirectoryTreeVolumes from "../../../../utilities/blockchain/volumes/configurationdirectorytreevolumes";

export default class Orderer implements IOrderer {
    private representation: OrganizationEntityRepresentation;
    private organization: OrdererOrganization;
    private options: Options;
    private cryptographicMaterialVolumes: ConfigurationDirectoryTreeVolumes<ConfigMap>;

    constructor(representation: OrganizationEntityRepresentation, organization: OrdererOrganization, options: Options, cryptographicMaterial: ConfigurationDirectoryTree<ConfigMap>) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;
        this.cryptographicMaterialVolumes = new ConfigurationDirectoryTreeVolumes(cryptographicMaterial);
    }

    private name(): string {
        return this.representation.name;
    }

    organizationName(): string {
        return this.organization.name();
    }

    namespace(): string {
        return this.organization.namespace();
    }

    id(): string {
        return identifier(this.name());
    }

    mspID(): string {
        return this.organization.mspID();
    }

    addResources(writer: ResourceWriter, outputPath: string): void {
        const deployment = new OrdererDeployment(this, this.options);
        const service = new OrdererService(this.id(), this.organization.name());

        writer.addWorkload({path: outputPath, name: this.id() + "-deployment", resource: deployment});
        writer.addResource({path: outputPath, name: this.id() + "-service", resource: service});
    }

    addVolume(spec: IPodSpec): void {
        this.organization.addOrganizationVolumeToPodSpec(spec);
    }

    mountCryptographicMaterial(container: IContainer, mountPath: string): void {
        this.cryptographicMaterialVolumes.findAndMount(ordererPathOnHost(this.name()), container, mountPath);
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec) {
        this.cryptographicMaterialVolumes.findAndAddAsVolumes(ordererPathOnHost(this.name()), spec);
    }

    mountCryptographicMaterialIntoVolume(container: IContainer, mountPath: string) {
        this.organization.mountOrdererCryptographicMaterialIntoVolume(this.name(), container, mountPath);
    }

    addGenesisBlockAsVolume(spec: IPodSpec) {
        this.organization.addGenesisBlockAsVolume(spec);
    }

    mountGenesisBlock(container: IContainer, mountPath: string): void {
        this.organization.mountGenesisBlock(container, mountPath);
    }

    mountGenesisBlockDirectoryIntoVolume(container: IContainer, mountPath: string) {
        this.organization.mountGenesisBlockDirectoryIntoVolume(container, mountPath);
    }

    mountGenesisBlockFileFromVolume(container: IContainer, mountPath: string) {
        this.organization.mountGenesisBlockFileFromVolume(container, mountPath);
    }

    mountMsp(container: IContainer, mountPath: string) {
        this.organization.mountOrdererMspFromVolume(this.name(), container, mountPath);
    }

    mountTls(container: IContainer, mountPath: string) {
        this.organization.mountOrdererTlsFromVolume(this.name(), container, mountPath);
    }
}