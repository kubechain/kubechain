import * as Path from 'path';
import MembershipServiceProvider from "./membershipserviceprovider";
import EntityMembershipServiceProviderRepresentation from "./representation";
import FilePaths from "../filepaths";
import MembershipServiceProviderRepresentation from "./membershipserviceproviderrepresentation";

export default class EntityMembershipServiceProvider {
    private msp: MembershipServiceProvider;
    private filePaths: FilePaths;

    constructor(name: string, path: string) {
        this.msp = new MembershipServiceProvider(name, path);
        this.filePaths = new FilePaths();
        this.filePaths.addSkFile('privateKey', Path.join(path, 'keystore'));
        this.filePaths.addPemFile('signingCertificate', Path.join(path, 'signcerts'));
    }

    toJson(): EntityMembershipServiceProviderRepresentation {
        const baseRepresentation: MembershipServiceProviderRepresentation = this.msp.toJson();
        const filePaths = this.filePaths.toJson();
        return {
            name: baseRepresentation.name,
            path: baseRepresentation.path,
            filePaths: {
                adminCertificate: baseRepresentation.filePaths.adminCertificate,
                certificateAuthorityCertificate: baseRepresentation.filePaths.certificateAuthorityCertificate,
                tlsCertificateAuthorityCertificate: baseRepresentation.filePaths.tlsCertificateAuthorityCertificate,
                privateKey: filePaths.privateKey,
                signingCertificate: filePaths.signingCertificate
            }
        }
    }
}