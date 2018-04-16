import Options from "../../../../../options";
import CommandLineInterfaceDeployment from "./deployment";
import PeerOrganization from "../../peer";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import ConfigMapTuple from "../../../../../utilities/kubernetes/configmaptuple";
import ConfigMapTuples from "../../../../../utilities/kubernetes/configmaptuples";
import PersistentVolumeClaim from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import {toJsonFile} from "../../../../../../../util";
import ResourceRequirements from "../../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import IVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";


export default class CommandLineInterFace {
    private options: Options;
    private organization: PeerOrganization;
    private configuration: ConfigMapTuples;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private volume: IVolume;

    constructor(organization: PeerOrganization, organizationName: string, options: Options, configuration: ConfigMapTuples) {
        this.organization = organization;
        this.options = options;
        this.configuration = configuration;
    }

    organizationName() {
        return this.organization.name()
    }

    namespace() {
        return this.organization.namespace();
    }

    addVolumeToPodSpec(spec: IPodSpec) {
        spec.addVolume(this.volume);
    }

    addPeerAdminConfigurationToContainer(container: IContainer, baseMountPath: string) {
        const tuples = this.configuration.findTuplesForRelativePath(this.organization.adminHostPath());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolumeMount(container, baseMountPath);
        });
    }

    addMspConfigurationToContainer(container: IContainer, mountPath: string) {
        const toVolumeMount = this.volume.toVolumeMount(mountPath);
        toVolumeMount.setSubPath(this.organization.adminMspMountPath());
        container.addVolumeMount(toVolumeMount);
    }

    addPeerAdminConfigurationAsVolumes(spec: IPodSpec) {
        const tuples = this.configuration.findTuplesForRelativePath(this.organization.adminHostPath());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolume(spec);
        });
    }

    mspID() {
        return this.organization.mspID();
    }

    toKubernetesResource(outputPath: string) {
        this.createVolume();
        const deployment = new CommandLineInterfaceDeployment(this, this.options);
        deployment.toKubernetesResource(outputPath);
        toJsonFile(outputPath, "cli-pvc", this.persistentVolumeClaim.toJson());
    }

    private createVolume() {
        this.persistentVolumeClaim = new PersistentVolumeClaim("cli-pvc", this.organization.namespace());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);
        this.volume = this.persistentVolumeClaim.toVolume();
    }
}