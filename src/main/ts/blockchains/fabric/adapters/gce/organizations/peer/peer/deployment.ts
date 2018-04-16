import * as Path from 'path';
import Peer from "./peer";
import Deployment from "../../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import Container from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import Options from "../../../../../options";
import ContainerPort from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/port";
import EnvVar from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import OrganizationEntityRepresentation from "../../../../../utilities/blockchain/representation/organizations/entities/representation";
import DirectoryOrCreateHostPathVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/hostpath/directoryorcreate";

export default class PeerDeployment {
    private peer: Peer;
    private namespace: string;
    private deploymentName: string;
    private representation: OrganizationEntityRepresentation;
    private runHostPathVolume: DirectoryOrCreateHostPathVolume;
    private deployment: Deployment;
    private options: Options;

    constructor(peer: Peer, representation: OrganizationEntityRepresentation, options: Options) {
        this.peer = peer;
        this.namespace = this.peer.namespace();
        this.options = options;
        this.deploymentName = this.peer.id() + "-" + this.peer.organizationName();
        this.representation = representation;

        this.createDeployment();
        this.createFunnelContainer();
        this.createHyperledgerContainers();
    }

    private createDeployment() {
        this.deployment = new Deployment(this.deploymentName, this.namespace);
        this.deployment.addMatchLabel("app", "hyperledger");
        this.deployment.addMatchLabel("role", "peer");
        this.deployment.addMatchLabel("peer-id", this.peer.id());
        this.deployment.addMatchLabel("org", this.peer.organizationName());

        this.runHostPathVolume = new DirectoryOrCreateHostPathVolume('run');
        this.runHostPathVolume.setHostPath(Path.posix.join(Path.posix.sep, 'var', 'run'));
        this.deployment.addVolume(this.runHostPathVolume);
        this.peer.addVolumeToPodSpec(this.deployment);
    }

    private createFunnelContainer() {
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");

        const funnelFromMountPath = Path.posix.join(PeerDeployment.funnelBaseMountPath(), 'from');
        this.peer.addConfigurationToContainer(funnelContainer, funnelFromMountPath);

        const funnelToMountPath = Path.posix.join(PeerDeployment.funnelBaseMountPath(), 'to');
        this.peer.addConfigurationToOrganizationVolume(funnelContainer, funnelToMountPath);
        this.peer.addConfigurationAsVolumes(this.deployment);
        this.deployment.addInitContainer(funnelContainer);
    }

    private createHyperledgerContainers() {
        this.createCouchDbContainer();
        this.createPeerContainer();
    }

    private createCouchDbContainer() {
        const couchDbContainer = new Container("couchdb", `hyperledger/fabric-couchdb:x86_64-${this.options.get("$.version")}`);
        couchDbContainer.addPort(new ContainerPort(undefined, 5984));
        this.deployment.addContainer(couchDbContainer);
    }

    private createPeerContainer() {
        const hyperledgerPeerContainer = new Container(this.deploymentName, `hyperledger/fabric-peer:x86_64-${this.options.get("$.version")}`);
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_LEDGER_STATE_STATEDATABASE", "CouchDB"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS", "localhost:5984"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_VM_ENDPOINT", "unix:///host/var/run/docker.sock"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_LOGGING_LEVEL", "DEBUG"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_TLS_ENABLED", "false"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_GOSSIP_USELEADERELECTION", "true"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_GOSSIP_ORGLEADER", "false"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_PROFILE_ENABLED", "true"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_TLS_CERT_FILE", "/etc/hyperledger/fabric/tls/server.crt"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_TLS_KEY_FILE", "/etc/hyperledger/fabric/tls/server.key"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_TLS_ROOTCERT_FILE", "/etc/hyperledger/fabric/tls/ca.crt"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_ID", this.peer.coreId()));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_ADDRESS", this.peer.address()));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_GOSSIP_EXTERNALENDPOINT", this.peer.gossipAddress()));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_LOCALMSPID", this.peer.mspID()));
        hyperledgerPeerContainer.setWorkingDirectory("/opt/gopath/src/github.com/hyperledger/fabric/peer");
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7051));
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7052));
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7053));
        hyperledgerPeerContainer.addCommand("/bin/bash");
        hyperledgerPeerContainer.addCommand("-c");
        hyperledgerPeerContainer.addCommand("--");
        hyperledgerPeerContainer.addArgument("sleep 5; peer node start");

        const hyperledgerMountPath = Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric');

        this.peer.addTlsToContainer(hyperledgerPeerContainer, Path.posix.join(hyperledgerMountPath, 'tls'));

        this.peer.addMspToContainer(hyperledgerPeerContainer, Path.posix.join(hyperledgerMountPath, 'msp'));
        const runHostPathVolumeMount = this.runHostPathVolume.toVolumeMount(Path.posix.join(Path.posix.sep, 'host', 'var', 'run', Path.posix.sep));
        hyperledgerPeerContainer.addVolumeMount(runHostPathVolumeMount);
        this.deployment.addContainer(hyperledgerPeerContainer);
    }

    static funnelBaseMountPath() {
        return Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
    }

    toJson() {
        return this.deployment.toJson();
    }

}