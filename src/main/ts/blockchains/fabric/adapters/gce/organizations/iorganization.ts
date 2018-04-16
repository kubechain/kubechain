export default interface IOrganization {
    name(): string;

    namespace(): string;

    mspID(): string;
}