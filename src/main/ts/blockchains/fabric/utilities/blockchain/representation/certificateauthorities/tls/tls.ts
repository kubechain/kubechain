import * as Path from 'path';
import FilePaths from "../../filepaths";
import TlsRepresentation from "./representation";

//TODO: Create Certificate super/component
export default class Tls {
    private name: string;
    private path: string;
    private filePaths: FilePaths;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
        this.filePaths = new FilePaths();
        this.filePaths.add('certificateAuthorityCertificate', Path.join(path, 'ca.crt'));
        this.filePaths.add('serverCertificate', Path.join(path, 'server.crt'));
        this.filePaths.add('serverKey', Path.join(path, 'server.key'));
    }

    toJson(): TlsRepresentation {
        const filePaths = this.filePaths.toJson();
        return {
            name: this.name,
            path: this.path,
            filePaths: {
                certificateAuthorityCertificate: filePaths.certificateAuthorityCertificate,
                serverCertificate: filePaths.serverCertificate,
                serverKey: filePaths.serverKey
            }
        }
    }
}

