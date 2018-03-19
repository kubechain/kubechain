export default interface EntityMembershipServiceProviderRepresentation {
    name: string
    path: string
    filePaths: {
        adminCertificate: string
        certificateAuthorityCertificate: string
        tlsCertificateAuthorityCertificate: string
        privateKey: string
        signingCertificate: string
    }
}