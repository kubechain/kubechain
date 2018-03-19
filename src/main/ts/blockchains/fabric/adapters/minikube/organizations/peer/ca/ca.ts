import CertificateAuthorityService from './service';
import CertificateAuthorityDeployment from './deployment';
import Options from "../../../../../options";
import PeerOrganization from "../../peer";
import {toJsonFile} from "../../../../../../../util";
import CertificateAuthorityRepresentation from "../../../../../utilities/blockchain/representation/certificateauthorities/ca/representation";

export default class CertificateAuthority {
    private organization: PeerOrganization;
    private representation: CertificateAuthorityRepresentation;
    private options: Options;

    constructor(organization: PeerOrganization, representation: CertificateAuthorityRepresentation, options: Options) {
        this.organization = organization;
        this.representation = representation;
        this.options = options;
    }

    toKubernetesResource(outputPath: string) {
        const caService = new CertificateAuthorityService(this.organization.name());
        const caDeployment = new CertificateAuthorityDeployment(this.organization, this.representation, this.options);
        toJsonFile(outputPath, "ca-deployment", caDeployment.toJson());
        toJsonFile(outputPath, "ca-service", caService.toJson());

    }
}