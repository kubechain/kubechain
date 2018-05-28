import IOrganization from "./iorganization";
import OrganizationRepresentation from "../representation/organizations/representation";
import {toDNS1123} from "../../../../../kubernetes-sdk/utilities/naming";

export default class Organization implements IOrganization {
    private representation: OrganizationRepresentation;

    constructor(representation: OrganizationRepresentation) {
        this.representation = representation;
    }

    name(): string {
        return toDNS1123(this.representation.name);
    }

    namespace(): string {
        return this.representation.domain;
    }

    mspID(): string {
        return this.representation.mspId;
    }
}