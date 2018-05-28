import OrdererDeployment from "./deployment";
import OrdererService from "./service";
import Options from "../../../../options";
import OrganizationEntityRepresentation from "../../../../utilities/blockchain/representation/organizations/entities/representation";
import OrdererOrganization from "../orderer";
import IPodSpec from "../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import * as Path from "path";
import ConfigMapTuples from "../../../../utilities/kubernetes/configmaptuples";
import ConfigMapTuple from "../../../../utilities/kubernetes/configmaptuple";
import PersistentVolumeClaim from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import IVolume from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import ResourceWriter from "../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IOrderer from "../../../../utilities/blockchain/organizations/orderer/entities/orderer/iorderer";
import ICryptographicMaterialCollector from "../../../../utilities/blockchain/cryptographic/icryptographicmaterialcollector";
import IGenesisBlockCollector from "../../../../utilities/blockchain/organizations/orderer/entities/igenesisblockcollector";
import {toDNS1123} from "../../../../../../kubernetes-sdk/utilities/naming";

export default class Orderer implements IOrderer, ICryptographicMaterialCollector, IGenesisBlockCollector {
    private representation: OrganizationEntityRepresentation;
    private organization: OrdererOrganization;
    private options: Options;
    private crypographicMaterial: ConfigMapTuples;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private volume: IVolume;

    constructor(representation: OrganizationEntityRepresentation, organization: OrdererOrganization, options: Options, organizationConfiguration: ConfigMapTuples) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;
        this.crypographicMaterial = organizationConfiguration;

        this.createVolume();
    }

    private createVolume() {
        this.persistentVolumeClaim = new PersistentVolumeClaim(toDNS1123(this.name()), this.organization.namespace());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);

        this.volume = this.persistentVolumeClaim.toVolume();
    }

    private name() {
        return this.representation.name;
    }

    organizationName() {
        return this.organization.name();
    }

    namespace() {
        return this.organization.namespace();
    }

    id() {
        return this.representation.name.split(".")[0]; //TODO: Change this.
    }

    mspID() {
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
        writer.addResource({path: outputPath, name: this.name() + "-pvc", resource: this.persistentVolumeClaim});
    }

    addVolume(spec: IPodSpec) {
        spec.addVolume(this.volume);
    }

    mountCryptographicMaterial(container: IContainer, baseMountPath: string): void {
        const relativePath = Path.join('orderers', this.name());
        const tuples = this.crypographicMaterial.findSubPathTuplesForRelativePath(relativePath);

        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsRelativeVolumeMount(container, baseMountPath);
        });
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec) {
        const relativePath = Path.join('orderers', this.name());
        const tuples = this.crypographicMaterial.findSubPathTuplesForRelativePath(relativePath);

        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addAsVolume(spec)
        });
    }

    addGenesisBlockAsVolume(spec: IPodSpec) {
        this.organization.addGenesisBlockAsVolume(spec);
    }

    mountGenesisBlock(container: IContainer, mountPath: string): void {
        this.organization.mountGenesisBlock(container, mountPath);
    }

    mountCryptographicMaterialFromVolume(container: IContainer, mountPath: string) {
        const ordererSubPath = Path.posix.join('orderers', this.name());
        const mount = this.volume.toVolumeMount(Path.posix.join(mountPath, ordererSubPath));
        mount.setSubPath(ordererSubPath);
        container.addVolumeMount(mount);
    }

    mountGenesisBlockDirectoryFromVolume(container: IContainer, mountPath: string) {
        const genesisBlockVolumeMount = this.volume.toVolumeMount(mountPath);
        genesisBlockVolumeMount.setSubPath(Path.posix.join('genesis'));
        container.addVolumeMount(genesisBlockVolumeMount);
    }

    mountGenesisBlockFileFromVolume(container: IContainer, mountPath: string): void {
        const genesisBlockVolumeMount = this.volume.toVolumeMount(mountPath);
        genesisBlockVolumeMount.setSubPath(Path.posix.join('genesis', 'genesis.block'));
        container.addVolumeMount(genesisBlockVolumeMount);
    }

    mountMsp(container: IContainer, mountPath: string) {
        const volumeMount = this.volume.toVolumeMount(mountPath);
        volumeMount.setSubPath(this.mspPathInContainer());
        container.addVolumeMount(volumeMount);
    }

    private mspPathInContainer(): string {
        return Path.posix.join('orderers', this.name(), 'msp');
    }

    mountTls(container: IContainer, mountPath: string) {
        const volumeMount = this.volume.toVolumeMount(mountPath);
        volumeMount.setSubPath(this.tlsPathInContainer());
        container.addVolumeMount(volumeMount);
    }

    private tlsPathInContainer(): string {
        return Path.posix.join('orderers', this.name(), 'tls');
    }
}