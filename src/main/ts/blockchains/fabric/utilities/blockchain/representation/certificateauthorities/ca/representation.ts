export default interface CertificateAuthorityRepresentation {
    name: string
    path: string
    filePaths: {
        privateKey: string
        certificate: string
    }
}