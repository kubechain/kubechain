export default interface TlsRepresentation {
    name: string
    path: string
    filePaths: {
        certificateAuthorityCertificate: string
        serverCertificate: string
        serverKey: string
    }
}
