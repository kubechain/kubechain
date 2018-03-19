import Organization from "../../../../../utilities/blockchain/representation/organizations/organization";
import PeerDeployment from "./deployment";
import PeerService from "./service";
import Options from "../../../../../options";
import OrganizationEntityRepresentation from "../../../../../utilities/blockchain/representation/organizations/entities/representation";
import PeerOrganization from "../../peer";
import {toJsonFile} from "../../../../../../../util";

export default class Peer {
    private representation: any;
    private organization: PeerOrganization;
    private options: Options;

    constructor(representation: OrganizationEntityRepresentation, organization: PeerOrganization, options: Options) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;
    }

    name(): string {
        return this.representation.name;
    }

    id(): string {
        return this.name().split(".")[0]; // TODO: Change this.
    }

    coreId() {
        return this.representation.name;
    }

    address() {
        return this.representation.name + ":7051";
    }

    gossipAddress() {
        return this.address();
    }

    _portOffset() {
        return parseInt((this.id().split("peer")[-1])) * 4;
    }

    toKubernetesResource(outputPath: string) {
        const deployment = new PeerDeployment(this.organization, this, this.representation, this.options);
        const service = new PeerService(this.organization.name(), this.id());

        toJsonFile(outputPath, this.id() + "-deployment", deployment.toJson());
        toJsonFile(outputPath, this.id() + "-service", service.toJson());
    }

}