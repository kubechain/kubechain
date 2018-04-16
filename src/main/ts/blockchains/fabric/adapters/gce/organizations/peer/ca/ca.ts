import CertificateAuthorityService from './service';
import CertificateAuthorityDeployment from './deployment';
import Options from "../../../../../options";
import PeerOrganization from "../../peer";
import {toJsonFile} from "../../../../../../../util";
import CertificateAuthorityRepresentation from "../../../../../utilities/blockchain/representation/certificateauthorities/ca/representation";
import IPodSpec from "../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import * as Path from "path";
import ConfigMapTuple from "../../../../../utilities/kubernetes/configmaptuple";
import ConfigMapTuples from "../../../../../utilities/kubernetes/configmaptuples";
import PersistentVolumeClaim from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim/persistentvolumeclaim";
import ResourceRequirements from "../../../../../../../kubernetes-sdk/api/1.8/meta/resourcerequirements";
import IVolume from "../../../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";

export default class CertificateAuthority {
    private organization: PeerOrganization;
    private representation: CertificateAuthorityRepresentation;
    private options: Options;
    private configuration: ConfigMapTuples;
    private persistentVolumeClaim: PersistentVolumeClaim;
    private volume: IVolume;

    constructor(organization: PeerOrganization, representation: CertificateAuthorityRepresentation, options: Options, organizationConfiguration: ConfigMapTuples) {
        this.organization = organization;
        this.representation = representation;
        this.options = options;
        this.configuration = organizationConfiguration;

        this.createVolume();
    }

    namespace() {
        return this.organization.namespace();
    }

    organizationName() {
        return this.organization.name();
    }

    addConfigurationToContainer(container: IContainer, mountPath: string) {
        const tuples = this.configuration.findTuplesForRelativePath(this.hostCaPath());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolumeMount(container, mountPath);
        });
    }

    addConfigurationFromVolume(container: IContainer, mountPath: string) {
        const volumeMount = this.volume.toVolumeMount(mountPath);
        volumeMount.setSubPath(this.caPath());
        container.addVolumeMount(volumeMount);
    }

    private caPath() {
        return Path.posix.join('ca', Path.posix.sep);
    }

    private hostCaPath() {
        return 'ca';
    }

    addConfigurationAsVolumes(spec: IPodSpec) {
        const tuples = this.configuration.findTuplesForRelativePath(this.hostCaPath());
        tuples.forEach((tuple: ConfigMapTuple) => {
            tuple.addConfigMapAsVolume(spec);
        });
    }

    toKubernetesResource(outputPath: string) {
        const caService = new CertificateAuthorityService(this.organization.name());
        const caDeployment = new CertificateAuthorityDeployment(this, this.representation, this.options);
        toJsonFile(outputPath, "ca-deployment", caDeployment.toJson());
        toJsonFile(outputPath, "ca-service", caService.toJson());
        toJsonFile(outputPath, "ca-pvc", this.persistentVolumeClaim.toJson());
    }

    addVolumeToPodSpec(podSpec: IPodSpec) {
        podSpec.addVolume(this.volume);
    }

    private createVolume() {
        this.persistentVolumeClaim = new PersistentVolumeClaim("ca", this.organization.namespace());
        this.persistentVolumeClaim.addAccessMode("ReadWriteOnce");
        const requirements = new ResourceRequirements();
        requirements.setRequests({"storage": "10Mi"});
        this.persistentVolumeClaim.setResourceRequirements(requirements);
        this.volume = this.persistentVolumeClaim.toVolume();
    }
}