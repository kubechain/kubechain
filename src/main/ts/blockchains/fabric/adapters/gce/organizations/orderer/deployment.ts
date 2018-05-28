import * as  Path from 'path';
import Orderer from "./orderer";
import Options from "../../../../options";
import Deployment from "../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import Container from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import EnvVar from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import ContainerPort from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/port";
import IHooks from "../../../../../utilities/iadapterhooks";

export default class OrdererDeployment {
    private options: Options;
    private orderer: Orderer;
    private name: string;
    private localMSPID: string;
    private deployment: Deployment;
    private hooks: IHooks;

    constructor(orderer: Orderer, options: Options) {
        this.orderer = orderer;
        this.options = options;
        this.hooks = options.get('$.hooks');
        this.name = this.orderer.id() + "-" + this.orderer.organizationName();
        this.localMSPID = orderer.mspID();

        this.createWorkload();
    }

    private createWorkload() {
        this.hooks.workload.beforeCreate({});
        this.deployment = new Deployment(this.name, this.orderer.organizationName());
        this.deployment.addMatchLabel("app", "hyperledger");
        this.deployment.addMatchLabel("role", "orderer");
        this.deployment.addMatchLabel("org", this.orderer.organizationName());
        this.deployment.addMatchLabel("orderer-id", this.orderer.id());

        this.orderer.addVolume(this.deployment);
        this.orderer.addGenesisBlockAsVolume(this.deployment);
        this.orderer.addCryptographicMaterialAsVolumes(this.deployment);

        this.addContainers()
    }

    private addContainers() {
        this.addFunnelContainer();
        this.addHyperledgerContainer();
    }

    private addFunnelContainer() {
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");
        const funnelFromMountPath = Path.posix.join(this.funnelBaseMountPath(), 'from');
        this.orderer.mountCryptographicMaterial(funnelContainer, funnelFromMountPath);
        this.orderer.mountGenesisBlock(funnelContainer, funnelFromMountPath);

        const funnelToMountPath = Path.posix.join(this.funnelBaseMountPath(), 'to');
        this.orderer.mountGenesisBlockDirectoryFromVolume(funnelContainer, Path.posix.join(funnelToMountPath, 'genesis'));
        this.orderer.mountCryptographicMaterialFromVolume(funnelContainer, funnelToMountPath);
        this.deployment.addInitContainer(funnelContainer);
    }

    //TODO: Check how/where orderers store channel genesis blocks.
    private addHyperledgerContainer() {
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
        hyperledgerContainer.setWorkingDirectory("/opt/gopath/src/github.com/hyperledger/fabric/orderer");
        hyperledgerContainer.addPort(new ContainerPort(undefined, 7050));
        hyperledgerContainer.addCommand("orderer");

        this.orderer.mountGenesisBlockFileFromVolume(hyperledgerContainer, genesisBlockMountPath);
        this.orderer.mountMsp(hyperledgerContainer, mspMountPath);
        this.orderer.mountTls(hyperledgerContainer, tlsMountPath);

        this.deployment.addContainer(hyperledgerContainer);
    }

    private funnelBaseMountPath() {
        return Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
    }

    toJson(): any {
        return this.deployment.toJson();
    }
}