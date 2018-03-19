import * as Path from 'path';
import FilePaths from "../filepaths";
import MembershipServiceProviderRepresentation from "./membershipserviceproviderrepresentation";

export default class MembershipServiceProvider {
    private name: string;
    private path: string;
    protected filePaths: FilePaths;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
        this.filePaths = new FilePaths();
        this.filePaths.addPemFile('adminCertificate', Path.join(path, 'admincerts'));
        this.filePaths.addPemFile('certificateAuthorityCertificate', Path.join(path, 'cacerts'));
        this.filePaths.addPemFile('tlsCertificateAuthorityCertificate', Path.join(path, 'tlscacerts'));
    }

    toJson(): MembershipServiceProviderRepresentation {
        const filePaths = this.filePaths.toJson();
        return {
            name: this.name,
            path: this.path,
            filePaths: {
                adminCertificate: filePaths.adminCertificate,
                certificateAuthorityCertificate: filePaths.certificateAuthorityCertificate,
                tlsCertificateAuthorityCertificate: filePaths.tlsCertificateAuthorityCertificate
            }
        }
    }
}