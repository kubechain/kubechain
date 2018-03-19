import * as Path from 'path';
import Peer from "./peer";
import Deployment from "../../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import Container from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import Options from "../../../../../options";
import ContainerPort from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/port";
import EnvVar from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import OrganizationEntityRepresentation from "../../../../../utilities/blockchain/representation/organizations/entities/representation";
import PeerOrganization from "../../peer";
import DirectoryOrCreateHostPathVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/hostpath/directoryorcreate";

export default class PeerDeployment {
    private organization: PeerOrganization;
    private peer: Peer;
    private namespace: string;
    private deploymentName: string;
    private representation: OrganizationEntityRepresentation;
    private runHostPathVolume: DirectoryOrCreateHostPathVolume;
    private deployment: Deployment;
    private options: Options;

    constructor(organization: PeerOrganization, peer: Peer, representation: OrganizationEntityRepresentation, options: Options) {
        this.organization = organization;
        this.peer = peer;
        this.namespace = organization.namespace();
        this.options = options;
        this.deploymentName = this.peer.id() + "-" + this.organization.name();
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
        this.deployment.addMatchLabel("org", this.organization.name());

        this.runHostPathVolume = new DirectoryOrCreateHostPathVolume('run');
        this.runHostPathVolume.setHostPath(Path.posix.join(Path.posix.sep, 'var', 'run'));
        this.deployment.addVolume(this.runHostPathVolume);
        this.organization.addOrganizationVolumeToPodSpec(this.deployment);
    }

    private createFunnelContainer() {
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");

        const funnelFromMountPath = Path.posix.join(PeerDeployment.funnelBaseMountPath(), 'from');
        this.organization.addPeerConfigurationToContainer(this.peer.name(), funnelContainer, funnelFromMountPath);
        // const osPathToMatch = Path.join('peers', this.peer.name());
        // const volumeConfig = this.organization.findVolumesAndVolumeMountsFor(osPathToMatch, funnelFromMountPath);
        // volumeConfig.volumeMounts.forEach((volumeMount: VolumeMount) => {
        //     funnelContainer.addVolumeMount(volumeMount);
        // });
        //TODO:
        // volumeConfig.volumes.forEach((volume: IVolume) => {
        //     this.deployment.addVolume(volume);
        // });

        const funnelToMountPath = Path.posix.join(PeerDeployment.funnelBaseMountPath(), 'to');
        this.organization.addPeerConfigurationToOrganizationVolume(this.peer.name(), funnelContainer, funnelToMountPath);
        this.organization.addPeerConfigurationAsVolumes(this.peer.name(), this.deployment);
        // this.organization.addPeerTlsToContainer(this.peer.name(), funnelContainer, Path.posix.join(funnelToMountPath, 'tls'));
        // const tlsMount = this.organizationVolume.toVolumeMount(Path.posix.join(funnelToMountPath, 'tls'));
        // tlsMount.setSubPath(this.tlsPath());
        // this.organization.addPeerMspToContainer(this.peer.name(), funnelContainer, Path.posix.join(funnelToMountPath, 'msp'));
        // const mspMount = this.organizationVolume.toVolumeMount(Path.posix.join(funnelToMountPath, 'msp'));
        // mspMount.setSubPath(this.mspPath());
        //
        // funnelContainer.addVolumeMount(mspMount);

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
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_LOCALMSPID", this.organization.mspID()));
        hyperledgerPeerContainer.setWorkingDirectory("/opt/gopath/src/github.com/hyperledger/fabric/peer");
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7051));
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7052));
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7053));
        hyperledgerPeerContainer.addCommand("/bin/bash");
        hyperledgerPeerContainer.addCommand("-c");
        hyperledgerPeerContainer.addCommand("--");
        hyperledgerPeerContainer.addArgument("sleep 5; peer node start");

        const hyperledgerMountPath = Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric');

        this.organization.addPeerTlsToContainer(this.peer.name(), hyperledgerPeerContainer, Path.posix.join(hyperledgerMountPath, 'tls'));
        // const tlsMount = this.organizationVolume.toVolumeMount(Path.posix.join(hyperledgerMountPath, 'tls'));
        // tlsMount.setSubPath(this.tlsPath());
        // hyperledgerPeerContainer.addVolumeMount(tlsMount);
        this.organization.addPeerMspToContainer(this.peer.name(), hyperledgerPeerContainer, Path.posix.join(hyperledgerMountPath, 'msp'));
        // const mspMount = this.organizationVolume.toVolumeMount(Path.posix.join(hyperledgerMountPath, 'msp'));
        // mspMount.setSubPath(this.mspPath());
        // hyperledgerPeerContainer.addVolumeMount(mspMount);
        const runHostPathVolumeMount = this.runHostPathVolume.toVolumeMount(Path.posix.join(Path.posix.sep, 'host', 'var', 'run', Path.posix.sep));
        hyperledgerPeerContainer.addVolumeMount(runHostPathVolumeMount);
        this.deployment.addContainer(hyperledgerPeerContainer);
    }

    static funnelBaseMountPath() {
        return Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
    }

    private tlsPath(): string {
        return Path.posix.join('peers', this.peer.name(), 'tls');
    }

    private mspPath(): string {
        return Path.posix.join('peers', this.peer.name(), 'msp');
    }

    toJson() {
        return this.deployment.toJson();
    }

}