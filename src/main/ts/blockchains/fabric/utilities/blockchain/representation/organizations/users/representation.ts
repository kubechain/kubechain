import EntityMembershipServiceProviderRepresentation from "../../membershipserviceproviders/representation";
import TlsRepresentation from "../../certificateauthorities/tls/representation";

export default interface UserRepresentation {
    name: string
    path: string
    type: string
    membershipServiceProvider: EntityMembershipServiceProviderRepresentation
    tls: TlsRepresentation
}
