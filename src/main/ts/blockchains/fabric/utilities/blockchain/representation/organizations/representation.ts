import CertificateAuthorityRepresentation from "../certificateauthorities/ca/representation";
import MembershipServiceProviderRepresentation from "../membershipserviceproviders/membershipserviceproviderrepresentation";
import TlscCrtificateAuthorityRepresentation from "../certificateauthorities/tlsca/representation";
import UserRepresentation from "./users/representation";
import OrganizationEntityRepresentation from "./entities/representation";

export default interface OrganizationRepresentation {
    name: string
    type: string
    path: string
    domain: string
    mspId: string
    certificateAuthority: CertificateAuthorityRepresentation
    membershipServiceProvider: MembershipServiceProviderRepresentation
    tlsCertificateAuthority: TlscCrtificateAuthorityRepresentation
    users: UserRepresentation[]
    entities: OrganizationEntityRepresentation[]
}
