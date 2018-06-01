import Options from "../../../../../options";
import OrganizationEntityRepresentation from "../../../../../utilities/blockchain/representation/organizations/entities/representation";
import PeerOrganization from "../../peer";
import ResourceWriter from "../../../../../utilities/blockchain/resourcewriter/resourcewriter";
import IHasResources from "../../../../../utilities/blockchain/organizations/ihasresources";
import IPeer from "../../../../../utilities/blockchain/organizations/peer/entities/peer/ipeer";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import {identifier} from "../../../../../utilities/blockchain/organizations/identifiers";
import PeerDeployment from "../../../../../utilities/blockchain/organizations/peer/entities/peer/deployment";
import PeerService from "../../../../../utilities/blockchain/organizations/peer/entities/peer/service";

export default class Peer implements IHasResources, IPeer {
    private representation: any;
    private organization: PeerOrganization;
    private options: Options;

    constructor(representation: OrganizationEntityRepresentation, organization: PeerOrganization, options: Options) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;
    }

    namespace() {
        return this.organization.namespace();
    }

    name(): string {
        return this.representation.name;
    }

    organizationName() {
        return this.organization.name();
    }

    id(): string {
        return identifier(this.name());
    }

    coreId() {
        return this.representation.name;
    }

    address() {
        return this.representation.name + ":7051";
    }

    mspID() {
        return this.organization.mspID();
    }

    gossipAddress() {
        return this.address();
    }

    addResources(writer: ResourceWriter, outputPath: string) {
        const deployment = new PeerDeployment(this, this.options);
        const service = new PeerService(this.organization.name(), this.id());

        writer.addWorkload({path: outputPath, name: this.id() + "-deployment", resource: deployment});
        writer.addResource({path: outputPath, name: this.id() + "-service", resource: service});
    }

    addVolume(spec: IPodSpec): void {
        this.organization.addVolumeToPodSpec(spec);
    }

    addCryptographicMaterialAsVolumes(spec: IPodSpec): void {
        this.organization.addPeerCryptographicMaterialAsVolumes(this.name(), spec);
    }

    mountCryptographicMaterial(container: IContainer, mountPath: string): void {
        this.organization.mountPeerCryptographicMaterial(this.name(), container, mountPath);
    }

    mountCryptographicMaterialIntoVolume(container: IContainer, mountPath: string): void {
        this.organization.mountPeerCryptographicMaterialFromOrganizationVolume(this.name(), container, mountPath);
    }

    mountTls(container: IContainer, mountPath: string): void {
        this.organization.mountPeerTls(this.name(), container, mountPath);
    }

    mountMsp(container: IContainer, mountPath: string): void {
        this.organization.mountPeerMsp(this.name(), container, mountPath);
    }

    addKubeDnsIpToArray(array: string[]): void {
        this.organization.addKubeDnsIpToArray(array);
    }

    mountChainCodes(container: IContainer, mountPath: string): void {
        this.organization.mountChainCodes(container, mountPath);
    }

    addChainCodeAsVolumes(spec: IPodSpec): void {
        this.organization.addChainCodeAsVolumes(spec);
    }
}