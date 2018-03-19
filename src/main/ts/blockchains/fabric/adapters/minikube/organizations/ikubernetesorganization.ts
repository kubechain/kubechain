export default interface IKubernetesOrganization {
    name(): string;

    namespace(): string;
}