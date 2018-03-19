import * as Path from 'path';
import Deployment from "../../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import Options from "../../../../../options";
import IVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import Container from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import EnvVar from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import ContainerPort from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/port";
import PeerOrganization from "../../peer";
import CertificateAuthorityRepresentation from "../../../../../utilities/blockchain/representation/certificateauthorities/ca/representation";

export default class CertificateAuthorityDeployment {
    private organization: PeerOrganization;
    private representation: CertificateAuthorityRepresentation;
    private options: Options;
    private deployment: Deployment;

    constructor(organization: PeerOrganization, representation: CertificateAuthorityRepresentation, options: Options) {
        this.organization = organization;
        this.representation = representation;
        this.options = options;

        const name = "ca";
        this.createDeployment(name);
        this.createFunnelContainer();
        this.createHyperledgerContainer(name);
    }

    private createDeployment(deploymentName: string) {
        this.deployment = new Deployment(deploymentName, this.organization.namespace());
        this.deployment.addMatchLabel("app", "hyperledger");
        this.deployment.addMatchLabel("role", deploymentName);
        this.deployment.addMatchLabel("org", this.organization.name());
        this.deployment.addMatchLabel("name", deploymentName);
        this.organization.addOrganizationVolumeToPodSpec(this.deployment);
    }

    private createFunnelContainer() {
        const funnelBasePath = Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");

        const funnelFromMountPath = Path.posix.join(funnelBasePath, 'from');
        this.organization.addCertificateAuthorityConfigurationToContainer(funnelContainer, funnelFromMountPath);
        // const configMap = directoryToConfigMap(this.representation.path, uuidv5("ca-" + this.organization.name(), this.organization.namespace()), this.organization.namespace());
        // // this.organization.directoriesToConfigMaps()['ca'];        //TODO: Fix this
        // const configMapVolume = configMap.toVolume();
        // funnelContainer.addVolumeMount(configMapVolume.toVolumeMount(funnelFromMountPath));


        const funnelToMountPath = Path.posix.join(funnelBasePath, 'to');
        this.organization.addCertificateAuthorityConfigurationFromVolume(funnelContainer, funnelToMountPath);
        // const toVolumeMount = this.organizationVolume.toVolumeMount(funnelToMountPath);
        // toVolumeMount.setSubPath(CertificateAuthorityDeployment.caPath());
        // funnelContainer.addVolumeMount(toVolumeMount);

        // this.deployment.addVolume(configMapVolume);
        this.organization.addCertificateAuthorityConfigurationAsVolumes(this.deployment);
        this.deployment.addInitContainer(funnelContainer);
    }

    private createHyperledgerContainer(name: string) {
        const caCertFile = Path.posix.join(CertificateAuthorityDeployment.hyperledgerMountPath(), Path.basename(this.representation.filePaths.certificate));
        const caKeyFile = Path.posix.join(CertificateAuthorityDeployment.hyperledgerMountPath(), Path.basename(this.representation.filePaths.privateKey));
        const hyperledgerCaContainer = new Container(name, `hyperledger/fabric-ca:x86_64-${this.options.get('$.version')}`);
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_HOME", "/etc/hyperledger/fabric-ca-server"));
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_SERVER_CA_NAME", "ca"));
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_SERVER_TLS_ENABLED", "false"));
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_SERVER_TLS_CERTFILE", caCertFile));
        hyperledgerCaContainer.addEnvironmentVariable(new EnvVar("FABRIC_CA_SERVER_TLS_KEYFILE", caKeyFile));
        hyperledgerCaContainer.addPort(new ContainerPort(undefined, 7054));
        hyperledgerCaContainer.addCommand("sh");
        hyperledgerCaContainer.addArgument("-c");
        hyperledgerCaContainer.addArgument(` fabric-ca-server start --ca.certfile ${caCertFile} --ca.keyfile ${caKeyFile} -b admin:adminpw -d `);

        this.organization.addCertificateAuthorityConfigurationFromVolume(hyperledgerCaContainer, CertificateAuthorityDeployment.hyperledgerMountPath());
        // const volumeMount = this.organizationVolume.toVolumeMount(CertificateAuthorityDeployment.hyperledgerMountPath());
        // volumeMount.setSubPath(CertificateAuthorityDeployment.caPath());
        // hyperledgerCaContainer.addVolumeMount(volumeMount);

        this.deployment.addContainer(hyperledgerCaContainer);
    }

    static hyperledgerMountPath() {
        return Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric-ca-server-config');
    }

    static caPath() {
        return Path.posix.join('ca', Path.posix.sep);
    }

    toJson(): any {
        return this.deployment.toJson();
    }
}