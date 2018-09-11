import * as Path from 'path';
import IPeer from "./ipeer";
import IResource from "../../../../../../../../kubernetes-sdk/api/1.8/iresource";
import DirectoryOrCreateHostPathVolume from "../../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/hostpath/directoryorcreate";
import Deployment from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import Options from "../../../../../../options";
import Container from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import ContainerPort from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/port";
import EnvVar from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import SecurityContext from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/securitycontext";
import EmptyDirVolume from "../../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/emptydir";

export default class PeerDeployment implements IResource {
    private peer: IPeer;
    private namespace: string;
    private deploymentName: string;
    private runHostPathVolume: DirectoryOrCreateHostPathVolume;
    private deployment: Deployment;
    private options: Options;
    private dns: string[];
    private dnsSearch: string[];
    private peerDataVolume: EmptyDirVolume;

    constructor(peer: IPeer, options: Options) {
        this.peer = peer;
        this.namespace = peer.namespace();
        this.options = options;
        this.deploymentName = this.peer.id() + "-" + this.peer.organizationName();

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
        if (this.options.get('$.affinity.peer')) {
            this.deployment.setAffinity(this.options.get('$.affinity.peer'));
        }

        this.peerDataVolume = new EmptyDirVolume("peer-data");
        this.runHostPathVolume = new DirectoryOrCreateHostPathVolume('run');
        this.runHostPathVolume.setHostPath(Path.posix.join(Path.posix.sep, 'var', 'run'));
        this.deployment.addVolume(this.peerDataVolume);
        this.deployment.addVolume(this.runHostPathVolume);
        this.peer.addVolume(this.deployment);
        this.peer.addCryptographicMaterialAsVolumes(this.deployment);
        this.peer.addChainCodeAsVolumes(this.deployment);
    }

    private createFunnelContainer() {
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");

        const funnelFromMountPath = Path.posix.join(PeerDeployment.funnelBaseMountPath(), 'from');
        this.peer.mountCryptographicMaterial(funnelContainer, funnelFromMountPath);

        const funnelToMountPath = Path.posix.join(PeerDeployment.funnelBaseMountPath(), 'to');
        this.peer.mountCryptographicMaterialIntoVolume(funnelContainer, funnelToMountPath);
        this.deployment.addInitContainer(funnelContainer);
    }

    private createHyperledgerContainers() {
        if (this.options.get("$.options.useCouchDb")) {
            this.createCouchDbContainer();
        }
        this.createPeerContainer();
    }

    private createCouchDbContainer() {
        const couchDbContainer = new Container("couchdb", `hyperledger/fabric-couchdb:${this.options.get("$.tags.couchDb") || this.options.get("$.version")}`);
        couchDbContainer.addPort(new ContainerPort(undefined, 5984));
        this.deployment.addContainer(couchDbContainer);
    }

    private createPeerContainer() {
        this.createDnsSettings();
        const workingDirectory = Path.posix.join(Path.posix.sep, "opt", "gopath", "src", "github.com", "hyperledger", "fabric", "peer");
        const hyperledgerPeerContainer = new Container(this.deploymentName, `hyperledger/fabric-peer:${this.options.get("$.tags.peer") || this.options.get("$.version")}`);
        if (this.options.get("$.options.useCouchDb")) {
            hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_LEDGER_STATE_STATEDATABASE", "CouchDB"));
            hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS", "localhost:5984"));
        }
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
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_CHAINCODELISTENADDRESS", "0.0.0.0:7052"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_GOSSIP_EXTERNALENDPOINT", this.peer.gossipAddress()));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_LOCALMSPID", this.peer.mspID()));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_VM_DOCKER_HOSTCONFIG_DNS", this.dns.join(" ")));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_VM_DOCKER_HOSTCONFIG_DNSSEARCH", this.dnsSearch.join(" ")));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_CHAINCODE_LOGGING_LEVEL", "debug"));
        hyperledgerPeerContainer.addEnvironmentVariable(new EnvVar("CORE_CHAINCODE_SHIM", "debug"));

        hyperledgerPeerContainer.setWorkingDirectory(workingDirectory);
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7051));
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7052));
        hyperledgerPeerContainer.addPort(new ContainerPort(undefined, 7053));
        hyperledgerPeerContainer.addCommand("/bin/bash");
        hyperledgerPeerContainer.addCommand("-c");
        hyperledgerPeerContainer.addCommand("--");
        hyperledgerPeerContainer.addArgument("sleep 5; peer node start");
        const context = new SecurityContext();
        context.setPrivileged(true);
        hyperledgerPeerContainer.setSecurityContext(context);

        const hyperledgerMountPath = Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric');

        hyperledgerPeerContainer.addVolumeMount(this.peerDataVolume.toVolumeMount(Path.posix.join(Path.posix.sep, "var", "hyperledger")));
        this.peer.mountTls(hyperledgerPeerContainer, Path.posix.join(hyperledgerMountPath, 'tls'));
        this.peer.mountMsp(hyperledgerPeerContainer, Path.posix.join(hyperledgerMountPath, 'msp'));
        this.peer.mountChainCodes(hyperledgerPeerContainer, Path.posix.join(workingDirectory, "chaincodes"));
        const runHostPathVolumeMount = this.runHostPathVolume.toVolumeMount(Path.posix.join(Path.posix.sep, 'host', 'var', 'run', Path.posix.sep));
        hyperledgerPeerContainer.addVolumeMount(runHostPathVolumeMount);
        this.deployment.addContainer(hyperledgerPeerContainer);
    }

    private createDnsSettings() {
        this.dns = [];
        this.peer.addKubeDnsIpToArray(this.dns);
        this.dnsSearch = [];
        this.dnsSearch.push("default.svc.cluster.local");
        this.dnsSearch.push("svc.cluster.local");
    }

    static funnelBaseMountPath() {
        return Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
    }

    toJson(): any {
        return this.deployment.toJson();
    }
}