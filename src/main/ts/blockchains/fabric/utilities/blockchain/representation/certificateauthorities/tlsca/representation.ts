export default interface TlscCrtificateAuthorityRepresentation {
    name: string
    path: string
    filePaths: {
        privateKey: string
        certificate: string
    }
}
