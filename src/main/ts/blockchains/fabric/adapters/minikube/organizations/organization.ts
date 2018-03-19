import * as Path from 'path';
import * as OS from 'os';
import IOrganization from './iorganization';
import * as Naming from '../../../../../kubernetes-sdk/utilities/naming'
import IVolume from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/ivolume";
import VolumeMount from "../../../../../kubernetes-sdk/api/1.8/workloads/container/volumemount";
import * as Platforms from "../../../../../targets/minikube/host/platforms/platforms";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import Options from "../../../options";
import * as Util from "../../../../../util";

export default class Organization implements IOrganization {
    private representation: OrganizationRepresentation;

    constructor(representation: OrganizationRepresentation, options: Options) {
        this.representation = representation;
        // TODO:
        // this.configDirectoryTreeToConfigMaps = ConfigMapUtil.directoryTreeToConfigMaps(this.configPath, this.namespace());
    }

    name(): string {
        return this.representation.name;
    }

    namespace(): string {
        return this.representation.name;
    }

    mspID(): string {
        return Util.capitalize(this.representation.name.split('-')[0]) + "MSP";
    }

    addressSegment() {
        const gap = 100;
        //Original source uses a number in the organizations' domain spec as the addressSegment.
        //This is based on name of the organizations. Should a user choose not to use org1 or org2 as names the code will break.
        //TODO: If this code is to be published and used this should be altered.
        return (parseInt(this.representation.name.split("-")[0].split("org")[1])) * gap;
    }

    // findVolumesAndVolumeMounts(denominator: string, baseMountPath: string) {
    //     const volumes: IVolume[] = [];
    //     const volumeMounts: VolumeMount[] = [];
    //
    //     this.configMaps().forEach((configMap: ConfigMap) => {
    //         const sourcePath = configMap.sourcePath();
    //         const pathSplit = sourcePath.split(denominator);
    //         if (pathSplit && pathSplit.length > 1) {
    //             const posixSubPath = Naming.pathToPosixPath(pathSplit[1]);
    //             const mountPath = Path.posix.join(baseMountPath, posixSubPath);
    //             const volume = configMap.toVolume();
    //             volumes.push(volume);
    //             volumeMounts.push(volume.toVolumeMount(mountPath));
    //         }
    //     });
    //
    //     return {
    //         volumes: volumes,
    //         volumeMounts: volumeMounts
    //     };
    // }

    // configMaps(): ConfigMap[] {
    //     // TODO:
    //     // return Object.values(this.configDirectoryTreeToConfigMaps);
    //     return [];
    // }

    minikubeSharedFolder(): string {
        // const platform = Platforms.getHostPlatform();
        return Path.posix.join(Path.posix.sep, 'data', '.kubechain', 'fabric', this.representation.name);
    }
}

