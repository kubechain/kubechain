const CertificateAuthorityService = require('./service');
const CertificateAuthorityDeployment = require('./deployment');

class CertificateAuthority {
    constructor(organization, options, fabricOptions) {
        this._organization = organization;
        this._options = options;
        this._fabricOptions = fabricOptions;
    }

    toKubernetesResource(outputPath) {
        const PORTSTARTFROM = 30000;
        const exposedPort = PORTSTARTFROM + this._organization.addressSegment();
        const caService = new CertificateAuthorityService(this._organization.name(), exposedPort);
        caService.toJSONFile(outputPath);
        const caDeployment = new CertificateAuthorityDeployment(this._organization, this._options, this._fabricOptions);
        caDeployment.toJSONFile(outputPath);
    }
}

module.exports = CertificateAuthority;