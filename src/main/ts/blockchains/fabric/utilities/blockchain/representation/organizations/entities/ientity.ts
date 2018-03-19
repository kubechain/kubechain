import OrganizationEntityRepresentation from "./representation";

export default interface IEntity {
    toJson(): OrganizationEntityRepresentation;
}