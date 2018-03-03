import * as Path from 'path';
import * as fs from 'fs-extra';
import * as Naming from '../../../../../kubernetes-sdk/utilities/naming';
import ObjectMeta from "../../../../../kubernetes-sdk/api/1.8/meta/objectmeta";
import EmptyDirVolume from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/emptydir";
import Pod from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/pod";
import PodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/podspec";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import Container from "../../../../../kubernetes-sdk/api/1.8/workloads/container/container";
import EnvVar from "../../../../../kubernetes-sdk/api/1.8/workloads/container/envvar";
import IVolume from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import * as ConfigMapUtil from "../../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/configmap";
import AccountRepresentation from "../../utilities/accounts/representation";
import ContainerPort from "../../../../../kubernetes-sdk/api/1.8/workloads/container/port";

export default class AccountPod {
    private options: any;
    private accountName: string;
    private namespace: string;
    private podSpec: PodSpec;
    private pod: Pod;
    private configMap: ConfigMap;
    private volume: EmptyDirVolume;
    private configVolume: IVolume;

    constructor(representation: AccountRepresentation, namespace: string, options: any) {
        this.accountName = Naming.toDNS1123(representation.name);
        this.namespace = namespace;
        this.options = options;
        const objectMeta = new ObjectMeta(this.accountName, namespace);
        objectMeta.addLabel("app", this.options.get('$.name'));
        this.podSpec = new PodSpec();
        this.podSpec.setHostname(this.accountName);
        this.podSpec.setSubDomain(this.options.get('$.name'));
        this.podSpec.setRestartPolicy("OnFailure");
        this.pod = new Pod(objectMeta);
        this.pod.setSpec(this.podSpec);

        this.configMap = ConfigMapUtil.createFromPath(representation.path, this.accountName + '-configmap', namespace);
        this.createVolumes();
        this.createContainers();
    }

    private createVolumes() {
        this.volume = new EmptyDirVolume('emptydir');
        this.podSpec.addVolume(this.volume);
        this.configVolume = this.configMap.toVolume();
        this.podSpec.addVolume(this.configVolume);
    }

    private createContainers() {
        const burrowNodeContainer = new Container(this.accountName + '-node', `quay.io/monax/db:0.17.0`);
        burrowNodeContainer.addPort(new ContainerPort("p2p", 46656));
        burrowNodeContainer.addPort(new ContainerPort("rpc", 46657));
        burrowNodeContainer.addPort(new ContainerPort("api", 1337));

        burrowNodeContainer.addEnvironmentVariable(new EnvVar('BURROW_WORKDIR', AccountPod.workingDirectory()));
        burrowNodeContainer.addEnvironmentVariable(new EnvVar('BURROW_DATADIR', AccountPod.dataDirectory()));

        burrowNodeContainer.addVolumeMount(this.configVolume.toVolumeMount(AccountPod.workingDirectory()));
        burrowNodeContainer.addVolumeMount(this.volume.toVolumeMount(AccountPod.dataDirectory()));
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
        this.jsonToFile(Path.join(path, this.accountName + '.json'), this.pod.toJson());
    }

    jsonToFile(filePath: string, json: any) {
        fs.outputFileSync(filePath, JSON.stringify(json, null, 4));
    }
}