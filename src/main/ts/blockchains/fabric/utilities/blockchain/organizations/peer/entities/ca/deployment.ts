import * as Path from 'path';
import IResource from "../../../../../../../../kubernetes-sdk/api/1.8/iresource";
import ICertificateAuthority from "./icertificateauthority";
import CertificateAuthorityRepresentation from "../../../../representation/certificateauthorities/ca/representation";
import Options from "../../../../../../options";
import Deployment from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import Container from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import EnvVar from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import ContainerPort from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/port";

export default class CertificateAuthorityDeployment implements IResource {
    private certificateAuthority: ICertificateAuthority;
    private representation: CertificateAuthorityRepresentation;
    private options: Options;
    private deployment: Deployment;

    constructor(certificateAuthority: ICertificateAuthority, representation: CertificateAuthorityRepresentation, options: Options) {
        this.certificateAuthority = certificateAuthority;
        this.representation = representation;
        this.options = options;

        const name = "ca";
        this.createDeployment(name);
        this.createFunnelContainer();
        this.createHyperledgerContainer(name);
    }

    private createDeployment(deploymentName: string) {
        this.deployment = new Deployment(deploymentName, this.certificateAuthority.namespace());
        this.deployment.addMatchLabel("app", "hyperledger");
        this.deployment.addMatchLabel("role", deploymentName);
        this.deployment.addMatchLabel("org", this.certificateAuthority.organizationName());
        this.deployment.addMatchLabel("name", deploymentName);
        if (this.options.get('$.affinity.ca')) {
            this.deployment.setAffinity(this.options.get('$.affinity.ca'));
        }
        this.certificateAuthority.addVolumeToPodSpec(this.deployment);
    }

    private createFunnelContainer() {
        const funnelBasePath = Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");

        const funnelFromMountPath = Path.posix.join(funnelBasePath, 'from');
        this.certificateAuthority.mountCryptographicMaterial(funnelContainer, funnelFromMountPath);

        const funnelToMountPath = Path.posix.join(funnelBasePath, 'to');
        this.certificateAuthority.mountCryptographicMaterialFromVolume(funnelContainer, funnelToMountPath);
        this.certificateAuthority.addCryptographicMaterialAsVolumes(this.deployment);
        this.deployment.addInitContainer(funnelContainer);
    }

    private createHyperledgerContainer(name: string) {
        const caCertFile = Path.posix.join(CertificateAuthorityDeployment.hyperledgerMountPath(), Path.basename(this.representation.filePaths.certificate));
        const caKeyFile = Path.posix.join(CertificateAuthorityDeployment.hyperledgerMountPath(), Path.basename(this.representation.filePaths.privateKey));
        const hyperledgerCaContainer = new Container(name, `hyperledger/fabric-ca:${this.options.get("$.tags.ca") || this.options.get('$.version')}`);
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_HOME", "/etc/hyperledger/fabric-ca-server"));
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_SERVER_CA_NAME", "ca"));
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_SERVER_TLS_ENABLED", "false"));
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_SERVER_TLS_CERTFILE", caCertFile));
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_SERVER_TLS_KEYFILE", caKeyFile));
        hyperledgerCaContainer.addPort(new ContainerPort(undefined, 7054));
        hyperledgerCaContainer.addCommand("sh");
        hyperledgerCaContainer.addArgument("-c");
        hyperledgerCaContainer.addArgument(` fabric-ca-server start --ca.certfile ${caCertFile} --ca.keyfile ${caKeyFile} -b admin:adminpw -d `);

        this.certificateAuthority.mountCryptographicMaterialFromVolume(hyperledgerCaContainer, CertificateAuthorityDeployment.hyperledgerMountPath());
        this.deployment.addContainer(hyperledgerCaContainer);
    }

    static hyperledgerMountPath() {
        return Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric-ca-server-config');
    }

    toJson(): any {
        return this.deployment.toJson();
    }
}