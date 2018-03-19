import * as Path from 'path';
import Options from "../../../../../options";
import PersistentVolumeClaim from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import Deployment from "../../../../../../../kubernetes-sdk/api/1.8/workloads/deployment/deployment";
import IVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import PeerOrganization from "../../peer";
import Container from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import EnvVar from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import ResourceRequirements from "../../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import HostPathPersistentVolume from "../../../../../../../kubernetes-sdk/api/1.8/cluster/persistentvolumes/hostpath/hostpath";
import ObjectMeta from "../../../../../../../kubernetes-sdk/api/1.8/meta/objectmeta";
import {toJsonFile} from "../../../../../../../util";
import DirectoryOrCreateHostPathVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/hostpath/directoryorcreate";

export default class CommandLineInterfaceDeployment {
    private organization: PeerOrganization;
    private name: string;
    private fabricOptions: Options;
    private deployment: Deployment;
    private artifactsVolume: IVolume;
    private artifactsPersistentVolume: HostPathPersistentVolume;
    private artifactsPersistentVolumeClaim: PersistentVolumeClaim;

    constructor(organization: PeerOrganization, fabricOptions: Options) {
        this.organization = organization;
        this.name = "cli";
        this.fabricOptions = fabricOptions;

        this.createArtifactsVolume();
        this.createDeployment();
        this.createFunnelContainer();
        this.createHyperledgerContainer();
    }

    private createArtifactsVolume() {
        //TODO: Check how and when artifacts are filled.
        //TODO: Consider moving this towards single peers or organizations.
        this.artifactsPersistentVolume = new HostPathPersistentVolume(new ObjectMeta(this.artifactsPersistentVolumeName(), undefined));
        this.artifactsPersistentVolume.setHostPath(Path.posix.join(Path.posix.sep, 'data', 'artifacts', this.organization.name()));
        this.artifactsPersistentVolume.setCapacity({"storage": "50Mi"});
        this.artifactsPersistentVolume.setStorageClassName(this.organization.name() + "-artifacts");
        this.artifactsPersistentVolume.addAccessMode("ReadWriteOnce");
        this.artifactsPersistentVolumeClaim = new PersistentVolumeClaim(this.artifactsPersistentVolumeClaimName(), this.organization.name(),
        );
        this.artifactsPersistentVolumeClaim.addAccessMode("ReadWriteOnce");
        this.artifactsPersistentVolumeClaim.setStorageClassName(this.organization.name() + "-artifacts");
        const requirements = new ResourceRequirements();
        requirements.setRequests({
            "storage": "10Mi"
        });
        this.artifactsPersistentVolumeClaim.setResourceRequirements(requirements);

        this.artifactsVolume = this.artifactsPersistentVolumeClaim.toVolume();
    }

    private artifactsPersistentVolumeName() {
        return this.organization.name() + "-artifacts-pv";

    }

    private artifactsPersistentVolumeClaimName() {
        return this.organization.name() + "-artifacts-pvc";
    }

    private createDeployment() {
        this.deployment = new Deployment(this.name, this.organization.namespace());
        this.deployment.addMatchLabel("app", "cli");
        this.deployment.addVolume(this.artifactsVolume);
        this.organization.addOrganizationVolumeToPodSpec(this.deployment);
    }

    private createFunnelContainer() {
        const funnelBasePath = Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
        const funnelFromMountPath = Path.posix.join(funnelBasePath, 'from');
        const funnelContainer = new Container("funnel", "kubechain/funnel:1.1.0");

        this.organization.addPeerAdminConfigurationToContainer(funnelContainer, funnelFromMountPath);
        // const funnelVolumeMap = this.organization.findVolumesAndVolumeMountsFor(pathToMatch, funnelFromMountPath); //TODO: Fix this.
        // funnelVolumeMap.volumeMounts.forEach((volumeMount: VolumeMount) => {
        //     funnelContainer.addVolumeMount(volumeMount);
        // });

        const funnelToMountPath = Path.posix.join(funnelBasePath, 'to');
        this.organization.addCliMspConfigurationToContainer(funnelContainer, funnelToMountPath);
        // const toVolumeMount = this.organizationVolume.toVolumeMount(funnelToMountPath);
        // toVolumeMount.setSubPath(this.mspPath());
        // funnelContainer.addVolumeMount(toVolumeMount);


        this.organization.addPeerAdminConfigurationAsVolumes(this.deployment);
        // funnelVolumeMap.volumes.map((volume: IVolume) => {
        //     this.deployment.addVolume(volume);
        // });

        this.deployment.addInitContainer(funnelContainer);
    }

    // private mspPath() {
    //     return Path.posix.join('users', `Admin@${this.organization.name()}`, 'msp');//TODO: Fix this.
    // }

    private createHyperledgerContainer() {
        const peerAddress = "peer0." + this.organization.name() + ":7051";
        const hyperledgerContainer = new Container(this.name, `hyperledger/fabric-tools:x86_64-${this.fabricOptions.get('$.version')}`);
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_TLS_ENABLED", "false"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_VM_ENDPOINT", "unix:///host/var/run/docker.sock"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("GOPATH", "/opt/gopath"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_LOGGING_LEVEL", "DEBUG"));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_ID", this.name));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_ADDRESS", peerAddress));
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_LOCALMSPID", this.organization.mspID())); //TODO: Fix this
        hyperledgerContainer.addEnvironmentVariable(new EnvVar("CORE_PEER_MSPCONFIGPATH", "/etc/hyperledger/fabric/msp"));
        hyperledgerContainer.setWorkingDirectory("/opt/gopath/src/github.com/hyperledger/fabric/peer");
        hyperledgerContainer.addCommand("/bin/bash");
        hyperledgerContainer.addCommand("-c");
        hyperledgerContainer.addCommand("--");
        hyperledgerContainer.addArgument("while true; do sleep 30; done;");

        const runHostPathVolume = new DirectoryOrCreateHostPathVolume('run');
        runHostPathVolume.setHostPath(Path.posix.join(Path.posix.sep, 'var', 'run'));
        hyperledgerContainer.addVolumeMount(runHostPathVolume.toVolumeMount(Path.posix.join(Path.posix.sep, 'host', 'var', 'run', Path.posix.sep)));
        this.deployment.addVolume(runHostPathVolume);

        const hyperLedgerMountPath = Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric', 'msp');
        this.organization.addCliMspConfigurationToContainer(hyperledgerContainer, hyperLedgerMountPath);
        // const mspVolumeMount = this.organizationVolume.toVolumeMount(hyperLedgerMountPath);
        // mspVolumeMount.setSubPath(this.mspPath());
        // hyperledgerContainer.addVolumeMount(mspVolumeMount);
        //TODO: Check usage of channel-artifacts
        hyperledgerContainer.addVolumeMount(this.artifactsVolume.toVolumeMount("/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts"));

        this.deployment.addContainer(hyperledgerContainer);

    }

    toKubernetesResource(outputPath: string) {
        toJsonFile(outputPath, this.name, this.deployment.toJson());
        toJsonFile(outputPath, this.artifactsPersistentVolumeName(), this.artifactsPersistentVolume.toJson());
        toJsonFile(outputPath, this.artifactsPersistentVolumeClaimName(), this.artifactsPersistentVolumeClaim.toJson());
    }
}