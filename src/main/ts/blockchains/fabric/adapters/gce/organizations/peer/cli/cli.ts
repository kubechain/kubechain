import Options from "../../../../../options";
import CommandLineInterfaceDeployment from "./deployment";
import PeerOrganization from "../../peer";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import PersistentVolumeClaim from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import IVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import ResourceWriter from "../../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IHasResources from "../../../../../utilities/blockchain/organizations/ihasresources";
import ICommandLineInterface from "../../../../../utilities/blockchain/organizations/peer/entities/cli/icommandlineinterface";
import * as Path from "path";


export default class CommandLineInterFace implements IHasResources, ICommandLineInterface {
    private options: Options;
    private organization: PeerOrganization;
    private volume: IVolume;
    private writer: ResourceWriter;
    private outputPath: string;

    constructor(organization: PeerOrganization, organizationName: string, options: Options) {
        this.organization = organization;
        this.options = options;
    }

    organizationName() {
        return this.organization.name()
    }

    namespace() {
        return this.organization.namespace();
    }

    mspID() {
        return this.organization.mspID();
    }


    addResources(writer: ResourceWriter, outputPath: string) {
        this.writer = writer;
        this.outputPath = outputPath;
        this.createVolume();
        this.createWorkload();
    }

    private createWorkload() {
        const deployment = new CommandLineInterfaceDeployment(this, this.options);
        this.writer.addResource({path: this.outputPath, name: "cli", resource: deployment});
    }

    private createVolume() {
        const persistentVolumeClaim = new PersistentVolumeClaim("cli-pvc", this.organization.namespace());
        persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        persistentVolumeClaim.setResourceRequirements(requirements);

        this.volume = persistentVolumeClaim.toVolume();
        this.writer.addResource({path: this.outputPath, name: "cli-pvc", resource: persistentVolumeClaim});
    }

    addVolumeToPodSpec(spec: IPodSpec) {
        spec.addVolume(this.volume);
    }

    mountPeerAdminCryptographicMaterial(container: IContainer, baseMountPath: string): void {
        this.organization.mountPeerAdminCryptographicMaterial(container, baseMountPath);
    }

    mountMspCryptographicMaterial(container: IContainer, mountPath: string) {
        const toVolumeMount = this.volume.toVolumeMount(mountPath);
        toVolumeMount.setSubPath(this.organization.adminMspMountPath());
        container.addVolumeMount(toVolumeMount);
    }

    addPeerAdminCryptographicMaterialAsVolumes(spec: IPodSpec): void {
        this.organization.addPeerAdminConfigurationAsVolumes(spec);
    }

    mountPeerAdminCryptographicMaterialFromVolume(container: IContainer, mountPath: string): void {
        const toVolumeMount = this.volume.toVolumeMount(Path.posix.join(mountPath, this.peerAdminPathInContainer()));
        toVolumeMount.setSubPath(this.peerAdminPathInContainer());
        container.addVolumeMount(toVolumeMount);
    }

    private peerAdminPathInContainer() {
        return Path.posix.join('users', `Admin@${this.organization.name()}`, 'msp');
    }

    mountChannels(container: IContainer, mountPath: string): void {
        this.organization.mountChannels(container, mountPath);
    }

    addChannelsAsVolumes(spec: IPodSpec): void {
        this.organization.addChannelsAsVolumes(spec);
    }

    mountChainCodes(container: IContainer, mountPath: string): void {
        this.organization.mountChainCodes(container, mountPath);
    }

    addChainCodeAsVolumes(spec: IPodSpec): void {
        this.organization.addChainCodeAsVolumes(spec);
    }
}