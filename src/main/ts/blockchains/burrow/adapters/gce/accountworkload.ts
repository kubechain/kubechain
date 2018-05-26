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
import Options from "../../options";
import IHooks from "../../../utilities/iadapterhooks";
import IResource from "../../../../kubernetes-sdk/api/1.8/iresource";

export default class AccountWorkload {
    private options: any;
    private name: string;
    private namespace: string;
    private podSpec: PodSpec;
    private pod: Pod;
    private configMap: ConfigMap;
    private volume: IVolume;
    private configVolume: IVolume;
    private representation: AccountRepresentation;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private hooks: IHooks;
    private resources: Array<{ path: string, resource: IResource }>;

    constructor(representation: AccountRepresentation, namespace: string, options: Options) {
        this.hooks = options.get('$.hooks');
        this.representation = representation;
        this.namespace = namespace;
        this.options = options;
        this.name = Naming.toDNS1123(representation.name);

        this.resources = [];


        this.hooks.workload.beforeCreate({
            name: this.name,
            service: this.options.get('$.name'),
            namespace: namespace
        });
        this.createWorkload();
        this.createConfiguration();
        this.createVolumes();
        this.addContainers();
    }

    private createWorkload() {
        const objectMeta = new ObjectMeta(this.name, this.namespace);
        objectMeta.addLabel("app", this.options.get('$.name'));
        objectMeta.addLabel("account", this.name);

        this.podSpec = new PodSpec();
        this.podSpec.setHostname(this.name);
        this.podSpec.setSubDomain(this.options.get('$.name'));
        this.podSpec.setRestartPolicy("OnFailure");

        const securityContext = new PodSecurityContext();
        securityContext.setFsGroup(101);
        securityContext.setUserId(1000);
        this.podSpec.setPodSecurityContext(securityContext);

        this.pod = new Pod(objectMeta);
        this.pod.setSpec(this.podSpec);

        this.resources.push({path: this.name + '.json', resource: this.pod});
    }

    private createConfiguration() {
        this.configMap = ConfigMapUtil.directoryToConfigMap(this.representation.path, this.name + '-configmap', this.namespace);
        this.resources.push({path: Path.join('configmaps', this.name + '-configmap.json'), resource: this.configMap});
        this.hooks.workload.createdConfiguration(this.configMap)
    }

    private createVolumes() {
        this.persistentVolumeClaim = new PersistentVolumeClaim(this.name + '-pvc', this.namespace);
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const resourceRequirements = new ResourceRequirements();
        resourceRequirements.setRequests({storage: "10Gi"});
        this.persistentVolumeClaim.setResourceRequirements(resourceRequirements);

        this.resources.push({path: Path.join(this.name + '-pvc.json'), resource: this.persistentVolumeClaim});

        this.volume = this.persistentVolumeClaim.toVolume();
        this.podSpec.addVolume(this.volume);
        this.configVolume = this.configMap.toVolume();
        this.podSpec.addVolume(this.configVolume);
    }

    private addContainers() {
        const burrowNodeContainer = new Container(this.name + '-node', `quay.io/monax/db:0.17.1`);
        burrowNodeContainer.addPort(new ContainerPort("p2p", 46656));
        burrowNodeContainer.addPort(new ContainerPort("rpc", 46657));
        burrowNodeContainer.addPort(new ContainerPort("api", 1337));

        burrowNodeContainer.addEnvironmentVariable(new EnvVar('BURROW_WORKDIR', AccountWorkload.workingDirectory()));
        burrowNodeContainer.addEnvironmentVariable(new EnvVar('BURROW_DATADIR', AccountWorkload.dataDirectory()));

        burrowNodeContainer.addVolumeMount(this.volume.toVolumeMount(AccountWorkload.baseDirectory()));
        burrowNodeContainer.addVolumeMount(this.configVolume.toVolumeMount(AccountWorkload.workingDirectory()));
        this.podSpec.addContainer(burrowNodeContainer);
    }

    static workingDirectory() {
        return Path.posix.join(AccountWorkload.baseDirectory(), 'config');
    }

    static dataDirectory() {
        return Path.posix.join(AccountWorkload.baseDirectory(), 'data');
    }

    static baseDirectory() {
        return Path.posix.join(Path.posix.sep, 'home', 'monax', '.monax');
    }


    write(path: string) {
        // this.hooks.workload.beforeWrite(this.resources);
        this.resources.forEach((resourceToWrite) => {
            this.jsonToFile(Path.join(path, resourceToWrite.path), resourceToWrite.resource.toJson());
        })
        // this.hooks.workload.written()
    }

    jsonToFile(filePath: string, json: any) {
        fs.outputFileSync(filePath, JSON.stringify(json, null, 4));
    }
}