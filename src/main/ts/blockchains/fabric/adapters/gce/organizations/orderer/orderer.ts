import OrdererDeployment from "./deployment";
import OrdererService from "./service";
import Options from "../../../../options";
import OrganizationEntityRepresentation from "../../../../utilities/blockchain/representation/organizations/entities/representation";
import OrdererOrganization from "../orderer";
import {toJsonFile} from "../../../../../../util";
import {directoryTreeToConfigMapTuples} from "../../../../utilities/kubernetes/configmap";
import IPodSpec from "../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import * as Path from "path";
import ConfigMapTuples from "../../../../utilities/kubernetes/configmaptuples";
import ConfigMapTuple from "../../../../utilities/kubernetes/configmaptuple";
import PersistentVolumeClaim from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import IVolume from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";

export default class Orderer {
    private representation: OrganizationEntityRepresentation;
    private organization: OrdererOrganization;
    private options: Options;
    private configMapTuples: ConfigMapTuples;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private volume: IVolume;

    constructor(representation: OrganizationEntityRepresentation, organization: OrdererOrganization, options: Options, organizationConfiguration: ConfigMapTuples) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;
        this.configMapTuples = organizationConfiguration;

        this.createVolume();
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

    addOrganizationVolumeToPodSpec(spec: IPodSpec) {
        this.organization.addOrganizationVolumeToPodSpec(spec);
    }

    addConfigurationToContainer(container: IContainer, baseMountPath: string) {
        const relativePath = Path.join('orderers', this.name());
        const tuples = this.configMapTuples.findSubPathTuplesForRelativePath(relativePath);

        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsRelativeVolumeMount(container, baseMountPath);
        });
    }

    addConfigurationAsVolume(spec: IPodSpec) {
        const relativePath = Path.join('orderers', this.name());
        const tuples = this.configMapTuples.findSubPathTuplesForRelativePath(relativePath);

        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolume(spec)
        });
    }

    //TODO: Consider moving this to `this.organization.addOrdererConfigurationAsVolume`
    addGenesisBlockAsVolume(spec: IPodSpec) {
        this.organization.addGenesisBlockAsVolume(spec);
    }

    addGenesisBlockVolumeToContainer(container: IContainer, mountPath: string) {
        this.organization.addGenesisBlockVolumeToContainer(container, mountPath);
    }

    addGenesisBlockToOrganizationVolume(container: IContainer, mountPath: string) {
        this.organization.addGenesisBlockToOrganizationVolume(container, mountPath);
    }

    addConfigurationToOrganizationVolume(container: IContainer, mountPath: string) {
        const peerSubPath = Path.posix.join('orderers', this.name());
        const mount = this.volume.toVolumeMount(Path.posix.join(mountPath, peerSubPath));//TODO: peerSubPath?
        mount.setSubPath(peerSubPath);
        container.addVolumeMount(mount);
    }

    addGenesisBlockToContainer(container: IContainer, mountPath: string) {
        this.organization.addGenesisBlockToContainer(container, mountPath);
    }

    addMspToContainer(container: IContainer, mountPath: string) {
        const volumeMount = this.volume.toVolumeMount(mountPath);
        volumeMount.setSubPath(this.mspPath());
        container.addVolumeMount(volumeMount);
    }

    private mspPath(): string {
        return Path.posix.join('orderers', this.name(), 'msp');
    }

    addTlsToContainer(container: IContainer, mountPath: string) {
        const volumeMount = this.volume.toVolumeMount(mountPath);
        volumeMount.setSubPath(this.tlsPath());
        container.addVolumeMount(volumeMount);
    }

    private tlsPath(): string {
        return Path.posix.join('orderers', this.name(), 'tls');
    }

    exposedPort() {
        const portStart = 32700;
        return portStart + this.portOffset();
    }

    private portOffset() {
        return parseInt(this.id().split("orderer")[1]); //TODO: Change this.
    }

    toKubernetesResource(outputPath: string) {
        const configMapTuples = directoryTreeToConfigMapTuples(this.representation.path, this.organization.namespace());
        const deployment = new OrdererDeployment(this, this.options, configMapTuples);
        const service = new OrdererService(this.id(), this.organization.name());

        toJsonFile(outputPath, this.id() + "-deployment", deployment.toJson());
        toJsonFile(outputPath, this.id() + "-service", service.toJson());
        toJsonFile(outputPath, this.name() + "-pvc", this.persistentVolumeClaim.toJson());
    }

    private createVolume() {
        this.persistentVolumeClaim = new PersistentVolumeClaim(this.name(), this.organization.namespace());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);

        this.volume = this.persistentVolumeClaim.toVolume();
    }
}