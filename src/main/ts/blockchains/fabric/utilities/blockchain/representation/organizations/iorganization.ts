import OrganizationRepresentation from "./representation";

export default interface IOrganization {
    toJson(): OrganizationRepresentation;
}