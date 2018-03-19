export default interface MembershipServiceProviderRepresentation {
    name: string
    path: string
    filePaths: {
        adminCertificate: string
        certificateAuthorityCertificate: string
        tlsCertificateAuthorityCertificate: string
    }
}