import OrdererDeployment from "./deployment";
import OrdererService from "./service";
import Options from "../../../../options";
import OrganizationEntityRepresentation from "../../../../utilities/blockchain/representation/organizations/entities/representation";
import OrdererOrganization from "../orderer";
import ResourceWriter from "../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IPodSpec from "../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import ConfigMapTuple from "../../../../utilities/kubernetes/configmaptuple";
import * as Path from "path";
import ConfigMapTuples from "../../../../utilities/kubernetes/configmaptuples";
import IOrderer from "../../../../utilities/blockchain/organizations/orderer/entities/orderer/iorderer";
import ICryptographicMaterialCollector from "../../../../utilities/blockchain/cryptographic/icryptographicmaterialcollector";

export default class Orderer implements IOrderer, ICryptographicMaterialCollector {
    private representation: OrganizationEntityRepresentation;
    private organization: OrdererOrganization;
    private options: Options;
    private cryptographicMaterial: ConfigMapTuples;

    constructor(representation: OrganizationEntityRepresentation, organization: OrdererOrganization, options: Options, organizationConfiguration: ConfigMapTuples) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;
        this.cryptographicMaterial = organizationConfiguration;
    }

    private name() {
        return this.representation.name;
    }

    organizationName(): string {
        return this.organization.name();
    }

    namespace() {
        return this.organization.namespace();
    }

    id() {
        return this.representation.name.split(".")[0]; //TODO: Change this.
    }

    mspID(): string {
        return this.organization.mspID();
    }


    exposedPort() {
        const portStart = 32700;
        return portStart + this.portOffset();
    }

    private portOffset() {
        return parseInt(this.id().split("orderer")[1]); //TODO: Change this.
    }

    addResources(writer: ResourceWriter, outputPath: string) {
        const deployment = new OrdererDeployment(this, this.options);
        const service = new OrdererService(this.id(), this.organization.name());

        writer.addWorkload({path: outputPath, name: this.id() + "-deployment", resource: deployment});
        writer.addResource({path: outputPath, name: this.id() + "-service", resource: service});
    }

    addVolume(spec: IPodSpec): void {
        this.organization.addOrganizationVolumeToPodSpec(spec);
    }

    mountCryptographicMaterial(container: IContainer, baseMountPath: string): void {
        const tuples = this.cryptographicMaterial.findSubPathTuplesForRelativePath(this.ordererPathOnHost());

        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsRelativeVolumeMount(container, baseMountPath);
        });
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec): void {
        const tuples = this.cryptographicMaterial.findSubPathTuplesForRelativePath(this.ordererPathOnHost());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addAsVolume(spec)
        });
    }

    private ordererPathOnHost() {
        return Path.join('orderers', this.name());
    }


    mountCryptographicMaterialFromVolume(container: IContainer, mountPath: string) {
        this.organization.mountOrdererCryptographicMaterialFromVolume(this.name(), container, mountPath);
    }

    addGenesisBlockAsVolume(spec: IPodSpec) {
        this.organization.addGenesisBlockAsVolume(spec);
    }

    mountGenesisBlock(container: IContainer, mountPath: string): void {
        this.organization.mountGenesisBlock(container, mountPath);
    }

    mountGenesisBlockDirectoryFromVolume(container: IContainer, mountPath: string) {
        this.organization.mountGenesisBlockDirectoryFromVolume(container, mountPath);
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