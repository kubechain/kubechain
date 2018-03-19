import OrdererDeployment from "./deployment";
import OrdererService from "./service";
import Options from "../../../../options";
import OrganizationEntityRepresentation from "../../../../utilities/blockchain/representation/organizations/entities/representation";
import OrdererOrganization from "../orderer";
import {toJsonFile} from "../../../../../../util";
import {directoryTreeToConfigMapTuples} from "../../../../utilities/kubernetes/configmap";

export default class Orderer {
    private representation: OrganizationEntityRepresentation;
    private organization: OrdererOrganization;
    private options: Options;

    constructor(representation: OrganizationEntityRepresentation, organization: OrdererOrganization, options: Options) {
        this.representation = representation;
        this.organization = organization;
        this.options = options;
    }

    name() {
        return this.representation.name;
    }

    id() {
        return this.representation.name.split(".")[0]; //TODO: Change this.
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
        const deployment = new OrdererDeployment(this, this.organization, this.options, configMapTuples);
        const service = new OrdererService(this.id(), this.organization.name());

        toJsonFile(outputPath, this.id() + "-deployment", deployment.toJson());
        toJsonFile(outputPath, this.id() + "-service", service.toJson());
    }

}