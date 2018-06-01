import Options from "../../../../../options";
import PeerOrganization from "../../peer";
import ResourceWriter from "../../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IHasResources from "../../../../../utilities/blockchain/organizations/ihasresources";
import ICommandLineInterface from "../../../../../utilities/blockchain/organizations/peer/entities/cli/icommandlineinterface";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import CommandLineInterfaceDeployment from "../../../../../utilities/blockchain/organizations/peer/entities/cli/deployment";

export default class CommandLineInterFace implements IHasResources, ICommandLineInterface {
    private options: Options;
    private deployment: CommandLineInterfaceDeployment;
    private organization: PeerOrganization;

    constructor(organization: PeerOrganization, organizationName: string, options: Options) {
        this.organization = organization;
        this.options = options;
        this.deployment = new CommandLineInterfaceDeployment(this, this.options);
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
        writer.addResource({path: outputPath, name: "cli", resource: this.deployment});
    }

    addVolumeToPodSpec(spec: IPodSpec): void {
        this.organization.addVolumeToPodSpec(spec);
    }

    mountPeerAdminCryptographicMaterial(container: IContainer, baseMountPath: string): void {
        this.organization.mountPeerAdminCryptographicMaterial(container, baseMountPath);
    }

    mountMspCryptographicMaterial(container: IContainer, mountPath: string): void {
        this.organization.mountCliMspCryptographicMaterial(container, mountPath);
    }

    mountPeerAdminCryptographicMaterialFromVolume(container: IContainer, mountPath: string) {
        this.organization.mountCliMspCryptographicMaterialFromVolume(container, mountPath);
    }

    addPeerAdminCryptographicMaterialAsVolumes(spec: IPodSpec): void {
        this.organization.addPeerAdminConfigurationAsVolumes(spec);
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