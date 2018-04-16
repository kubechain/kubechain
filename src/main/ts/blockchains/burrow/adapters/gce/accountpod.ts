import * as Path from 'path';
import * as fs from 'fs-extra';
import * as Naming from '../../../../kubernetes-sdk/utilities/naming';
import ObjectMeta from "../../../../kubernetes-sdk/api/1.8/meta/objectmeta";
import Pod from "../../../../kubernetes-sdk/api/1.8/workloads/pod/pod";
import PodSpec from "../../../../kubernetes-sdk/api/1.8/workloads/pod/podspec";
import ConfigMap from "../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import Container from "../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import EnvVar from "../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import IVolume from "../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import * as ConfigMapUtil from "../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/configmap";
import ContainerPort from "../../../../kubernetes-sdk/api/1.8/workloads/container/port";
import AccountRepresentation from "../../utilities/accounts/representation";
import PersistentVolumeClaim from "../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import PodSecurityContext from "../../../../kubernetes-sdk/api/1.8/workloads/pod/securitycontext";

export default class AccountPod {
    private options: any;
    private accountName: string;
    private namespace: string;
    private podSpec: PodSpec;
    private pod: Pod;
    private configMap: ConfigMap;
    private volume: IVolume;
    private configVolume: IVolume;
    private representation: AccountRepresentation;
    private persistentVolumeClaim: PersistentVolumeClaim;

    constructor(representation: AccountRepresentation, namespace: string, options: any) {
        this.representation = representation;
        this.namespace = namespace;
        this.options = options;
        this.accountName = Naming.toDNS1123(representation.name);

        this.createConfiguration();
        this.createWorkload();
        this.createVolumes();
        this.addContainers();
    }

    private createConfiguration() {
        this.configMap = ConfigMapUtil.directoryToConfigMap(this.representation.path, this.accountName + '-configmap', this.namespace);
    }

    private createWorkload() {
        const objectMeta = new ObjectMeta(this.accountName, this.namespace);
        objectMeta.addLabel("app", this.options.get('$.name'));
        objectMeta.addLabel("account", this.accountName);

        this.podSpec = new PodSpec();
        this.podSpec.setHostname(this.accountName);
        this.podSpec.setSubDomain(this.options.get('$.name'));
        this.podSpec.setRestartPolicy("OnFailure");
        const securityContext = new PodSecurityContext();
        securityContext.setFsGroup(101);
        securityContext.setUserId(1000);
        this.podSpec.setPodSecurityContext(securityContext);

        this.pod = new Pod(objectMeta);
        this.pod.setSpec(this.podSpec);
    }

    private createVolumes() {
        this.persistentVolumeClaim = new PersistentVolumeClaim(this.accountName + '-pvc', this.namespace);
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const resourceRequirements = new ResourceRequirements();
        resourceRequirements.setRequests({storage: "10Gi"});
        this.persistentVolumeClaim.setResourceRequirements(resourceRequirements);

        this.volume = this.persistentVolumeClaim.toVolume();
        this.podSpec.addVolume(this.volume);
        this.configVolume = this.configMap.toVolume();
        this.podSpec.addVolume(this.configVolume);
    }

    private addContainers() {
        const burrowNodeContainer = new Container(this.accountName + '-node', `quay.io/monax/db:0.17.1`);
        burrowNodeContainer.addPort(new ContainerPort("p2p", 46656));
        burrowNodeContainer.addPort(new ContainerPort("rpc", 46657));
        burrowNodeContainer.addPort(new ContainerPort("api", 1337));

        burrowNodeContainer.addEnvironmentVariable(new EnvVar('BURROW_WORKDIR', AccountPod.workingDirectory()));
        burrowNodeContainer.addEnvironmentVariable(new EnvVar('BURROW_DATADIR', AccountPod.dataDirectory()));

        burrowNodeContainer.addVolumeMount(this.volume.toVolumeMount(AccountPod.baseDirectory()));
        burrowNodeContainer.addVolumeMount(this.configVolume.toVolumeMount(AccountPod.workingDirectory()));
        this.podSpec.addContainer(burrowNodeContainer);
    }

    static workingDirectory() {
        return Path.posix.join(AccountPod.baseDirectory(), 'config');
    }

    static dataDirectory() {
        return Path.posix.join(AccountPod.baseDirectory(), 'data');
    }

    static baseDirectory() {
        return Path.posix.join(Path.posix.sep, 'home', 'monax', '.monax');
    }

    toJsonFile(path: string) {
        this.jsonToFile(Path.join(path, 'configmaps', this.accountName + '-configmap.json'), this.configMap.toJson());
        this.jsonToFile(Path.join(path, this.accountName + '-pvc.json'), this.persistentVolumeClaim.toJson());
        this.jsonToFile(Path.join(path, this.accountName + '.json'), this.pod.toJson());
    }

    //TODO: Place in util.
    private jsonToFile(filePath: string, json: any) {
        fs.outputFileSync(filePath, JSON.stringify(json, null, 4));
    }
}