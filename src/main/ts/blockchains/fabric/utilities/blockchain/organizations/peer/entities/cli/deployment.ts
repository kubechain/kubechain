import * as Path from 'path';
import IResource from "../../../../../../../../kubernetes-sdk/api/1.8/iresource";
import ICommandLineInterface from "./icommandlineinterface";
import Options from "../../../../../../options";
import Deployment from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import Container from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import EnvVar from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import DirectoryOrCreateHostPathVolume from "../../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/hostpath/directoryorcreate";

export default class CommandLineInterfaceDeployment implements IResource {
    private commandLineInterface: ICommandLineInterface;
    private name: string;
    private options: Options;
    private deployment: Deployment;

    constructor(commandLineInterFace: ICommandLineInterface, options: Options) {
        this.commandLineInterface = commandLineInterFace;
        this.options = options;
        this.name = "cli";

        this.createDeployment();
        this.createFunnelContainer();
        this.createHyperledgerContainer();
    }

    private createDeployment() {
        this.deployment = new Deployment(this.name, this.commandLineInterface.namespace());
        this.deployment.addMatchLabel("app", "cli");
        this.commandLineInterface.addVolumeToPodSpec(this.deployment);
        this.commandLineInterface.addChannelsAsVolumes(this.deployment);
        this.commandLineInterface.addChainCodeAsVolumes(this.deployment);
    }

    private createFunnelContainer() {
        const funnelBasePath = Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
        const funnelFromMountPath = Path.posix.join(funnelBasePath, 'from');
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");
        this.commandLineInterface.mountPeerAdminCryptographicMaterial(funnelContainer, funnelFromMountPath);

        const funnelToMountPath = Path.posix.join(funnelBasePath, 'to');
        this.commandLineInterface.mountPeerAdminCryptographicMaterialFromVolume(funnelContainer, funnelToMountPath);
        this.commandLineInterface.addPeerAdminCryptographicMaterialAsVolumes(this.deployment);

        this.deployment.addInitContainer(funnelContainer);
    }

    private createHyperledgerContainer() {
        const workingDirectory = Path.posix.join(Path.posix.sep, "opt", "gopath", "src", "github.com", "hyperledger", "fabric", "peer");
        const peerAddress = "peer0." + this.commandLineInterface.organizationName() + ":7051";
        const hyperledgerContainer = new Container(this.name, `hyperledger/fabric-tools:x86_64-${this.options.get('$.version')}`);
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_TLS_ENABLED", "false"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_VM_ENDPOINT", "unix:///host/var/run/docker.sock"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("GOPATH", "/opt/gopath"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_LOGGING_LEVEL", "DEBUG"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_ID", this.name));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_ADDRESS", peerAddress));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_LOCALMSPID", this.commandLineInterface.mspID()));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_MSPCONFIGPATH", "/etc/hyperledger/fabric/msp"));
        hyperledgerContainer.setWorkingDirectory(workingDirectory);
        hyperledgerContainer.addCommand("/bin/bash");
        hyperledgerContainer.addCommand("-c");
        hyperledgerContainer.addCommand("--");
        hyperledgerContainer.addArgument("while true; do sleep 30; done;");

        const runHostPathVolume = new DirectoryOrCreateHostPathVolume('run');
        runHostPathVolume.setHostPath(Path.posix.join(Path.posix.sep, 'var', 'run'));
        hyperledgerContainer.addVolumeMount(runHostPathVolume.toVolumeMount(Path.posix.join(Path.posix.sep, 'host', 'var', 'run', Path.posix.sep)));
        this.deployment.addVolume(runHostPathVolume);

        const hyperLedgerMountPath = Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric', 'msp');
        this.commandLineInterface.mountMspCryptographicMaterial(hyperledgerContainer, hyperLedgerMountPath);
        this.commandLineInterface.mountChannels(hyperledgerContainer, Path.posix.join(workingDirectory, "channels"));
        this.commandLineInterface.mountChainCodes(hyperledgerContainer, Path.posix.join(workingDirectory, "chaincodes"));

        this.deployment.addContainer(hyperledgerContainer);
    }

    toJson(): any {
        return this.deployment.toJson();
    }
}