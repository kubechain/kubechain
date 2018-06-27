import Options from "../../../../options";
import OrganizationEntityRepresentation from "../../../../utilities/blockchain/representation/organizations/entities/representation";
import OrdererOrganization from "../orderer";
import IPodSpec from "../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import * as Path from "path";
import PersistentVolumeClaim from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import ResourceWriter from "../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IOrderer from "../../../../utilities/blockchain/organizations/orderer/entities/orderer/iorderer";
import {toDNS1123} from "../../../../../../kubernetes-sdk/utilities/naming";
import ConfigurationDirectoryTree from "../../../../utilities/kubernetes/directorytree/configurationdirectorytree";
import ConfigMap from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import {
    genesisBlockDirectoryPathInContainer,
    genesisBlockFilePathInContainer,
    ordererMspPathInContainer, ordererPathInContainer, ordererPathOnHost,
    ordererTlsPathInContainer
} from "../../../../utilities/blockchain/cryptographic/paths";
import {identifier} from "../../../../utilities/blockchain/organizations/identifiers";
import OrdererDeployment from "../../../../utilities/blockchain/organizations/orderer/entities/orderer/deployment";
import OrdererService from "../../../../utilities/blockchain/organizations/orderer/entities/orderer/service";
import FabricVolume from "../../../../utilities/blockchain/volumes/volume";
import ConfigurationDirectoryTreeVolumes from "../../../../utilities/blockchain/volumes/configurationdirectorytreevolumes";

export default class Orderer implements IOrderer {
    private representation: OrganizationEntityRepresentation;
    private organization: OrdererOrganization;
    private options: Options;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private volume: FabricVolume;
    private cryptographicMaterialVolumes: ConfigurationDirectoryTreeVolumes<ConfigMap>;

    constructor(representation: OrganizationEntityRepresentation, organization: OrdererOrganization, options: Options, cryptographicMaterial: ConfigurationDirectoryTree<ConfigMap>) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;
        this.cryptographicMaterialVolumes = new ConfigurationDirectoryTreeVolumes(cryptographicMaterial);

        this.createVolume();
    }

    private createVolume() {
        this.persistentVolumeClaim = new PersistentVolumeClaim(toDNS1123(this.name()), this.organization.namespace());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);

        this.volume = new FabricVolume(this.persistentVolumeClaim.toVolume());
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
        writer.addResource({path: outputPath, name: this.name() + "-pvc", resource: this.persistentVolumeClaim});
    }

    addVolume(spec: IPodSpec): void {
        spec.addVolume(this.volume);
    }

    mountCryptographicMaterial(container: IContainer, mountPath: string): void {
        this.cryptographicMaterialVolumes.findAndMount(ordererPathOnHost(this.name()), container, mountPath);
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec) {
        this.cryptographicMaterialVolumes.findAndAddAsVolumes(ordererPathOnHost(this.name()), spec);
    }

    addGenesisBlockAsVolume(spec: IPodSpec) {
        this.organization.addGenesisBlockAsVolume(spec);
    }

    mountGenesisBlock(container: IContainer, mountPath: string): void {
        this.organization.mountGenesisBlock(container, mountPath);
    }

    mountCryptographicMaterialIntoVolume(container: IContainer, mountPath: string) {
        const ordererSubPath = ordererPathInContainer(this.name());
        this.volume.mount(container, Path.posix.join(mountPath, ordererSubPath), ordererSubPath);
    }

    mountGenesisBlockDirectoryIntoVolume(container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, genesisBlockDirectoryPathInContainer());
    }

    mountGenesisBlockFileFromVolume(container: IContainer, mountPath: string): void {
        this.volume.mount(container, mountPath, genesisBlockFilePathInContainer());
    }

    mountMsp(container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, ordererMspPathInContainer(this.name()));
    }

    mountTls(container: IContainer, mountPath: string) {
        this.volume.mount(container, mountPath, ordererTlsPathInContainer(this.name()))
    }
}