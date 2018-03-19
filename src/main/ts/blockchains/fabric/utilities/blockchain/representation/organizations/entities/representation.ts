import EntityMembershipServiceProviderRepresentation from "../../membershipserviceproviders/representation";
import TlsRepresentation from "../../certificateauthorities/tls/representation";

export default interface OrganizationEntityRepresentation {
    name: string
    path: string
    type: string
    membershipServiceProvider: EntityMembershipServiceProviderRepresentation
    tls: TlsRepresentation
}
