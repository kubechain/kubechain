import * as  Path from 'path';
import Orderer from "./orderer";
import Options from "../../../../options";
import Deployment from "../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import Container from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import EnvVar from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import ContainerPort from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/port";
import OrdererOrganization from "../orderer";
import ConfigMapTuples from "../../../../utilities/kubernetes/configmaptuples";

export default class OrdererDeployment {
    private organization: OrdererOrganization;
    private options: Options;
    private orderer: Orderer;
    private name: string;
    private localMSPID: string;
    private deployment: Deployment;
    private configMapTuples: ConfigMapTuples;

    constructor(orderer: Orderer, organization: OrdererOrganization, options: Options, configMapTuples: ConfigMapTuples) {
        this.orderer = orderer;
        this.organization = organization;
        this.options = options;
        this.configMapTuples = configMapTuples;
        this.name = this.orderer.id() + "-" + this.organization.name();
        this.localMSPID = organization.mspID();

        this.createDeployment();
        this.createFunnelContainer();
        this.createHyperledgerContainer();
    }

    private createDeployment() {
        this.deployment = new Deployment(this.name, this.organization.name());
        this.deployment.addMatchLabel("app", "hyperledger");
        this.deployment.addMatchLabel("role", "orderer");
        this.deployment.addMatchLabel("org", this.organization.name());
        this.deployment.addMatchLabel("orderer-id", this.orderer.id());

        this.organization.addOrganizationVolumeToPodSpec(this.deployment);
    }

    private createFunnelContainer() {
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");
        const funnelFromMountPath = Path.posix.join(this.funnelBaseMountPath(), 'from');

        this.organization.addOrdererConfigurationToContainer(this.orderer.name(), funnelContainer, funnelFromMountPath);

        this.organization.addOrdererConfigurationAsVolume(this.orderer.name(), this.deployment);
        this.organization.addGenesisBlockAsVolume(this.deployment);
        this.organization.addGenesisBlockVolumeToContainer(funnelContainer, funnelFromMountPath);

        const funnelToMountPath = Path.posix.join(this.funnelBaseMountPath(), 'to');
        this.organization.addGenesisBlockToOrganizationVolume(funnelContainer, Path.posix.join(funnelToMountPath, 'genesis'));
        this.organization.addOrdererConfigurationToOrganizationVolume(this.orderer.name(), funnelContainer, funnelToMountPath);
        this.deployment.addInitContainer(funnelContainer);
    }

    private createHyperledgerContainer() {
        const hyperledgerMountPath = Path.posix.join(Path.posix.sep, 'var', 'hyperledger', 'orderer');
        const genesisBlockMountPath = Path.posix.join(hyperledgerMountPath, 'orderer.genesis.block');
        const mspMountPath = Path.posix.join(hyperledgerMountPath, 'msp');
        const tlsMountPath = Path.posix.join(hyperledgerMountPath, 'tls');
        const hyperledgerContainer = new Container(this.name, `hyperledger/fabric-orderer:x86_64-${this.options.get('$.version')}`);
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_LOGLEVEL", "debug"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_LISTENADDRESS", "0.0.0.0"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_GENESISMETHOD", "file"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_GENESISFILE", genesisBlockMountPath));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_LOCALMSPID", this.localMSPID));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_LOCALMSPDIR", mspMountPath));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_TLS_ENABLED", "false"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_TLS_PRIVATEKEY", "/var/hyperledger/orderer/tls/server.key"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_TLS_CERTIFICATE", "/var/hyperledger/orderer/tls/server.crt"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("ORDERER_GENERAL_TLS_ROOTCAS", "[/var/hyperledger/orderer/tls/ca.crt]"));
        hyperledgerContainer.setWorkingDirectory("/opt/gopath/src/github.com/hyperledger/fabric/peer");
        hyperledgerContainer.addPort(new ContainerPort(undefined, 7050));
        hyperledgerContainer.addCommand("orderer");


        this.organization.addGenesisBlockToContainer(hyperledgerContainer, genesisBlockMountPath);
        this.organization.addOrdererMspToContainer(this.orderer.name(), hyperledgerContainer, mspMountPath);
        this.organization.addOrdererTlsToContainer(this.orderer.name(), hyperledgerContainer, tlsMountPath);

        this.deployment.addContainer(hyperledgerContainer);
    }


    private funnelBaseMountPath() {
        return Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
    }

    toJson(): any {
        return this.deployment.toJson();
    }
}