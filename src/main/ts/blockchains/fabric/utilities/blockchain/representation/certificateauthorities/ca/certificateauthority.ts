import FilePaths from "../../filepaths";
import CertificateAuthorityRepresentation from "./representation";

export default class CertificateAuthority {
    private name: string;
    private path: string;
    private filePaths: FilePaths;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
        this.filePaths = new FilePaths();
        this.filePaths.addSkFile('privateKey', path);
        this.filePaths.addPemFile('certificate', path);
    }

    toJson(): CertificateAuthorityRepresentation {
        const filePaths = this.filePaths.toJson();
        return {
            name: this.name,
            path: this.path,
            filePaths: {
                privateKey: filePaths.privateKey,
                certificate: filePaths.certificate
            }
        }
    }
}