const Path = require('path');
const OS = require('os');
const KubernetesNaming = require('../../../../../kubernetes-sdk/utilities/naming');
const Platforms = require('../../host/platforms/platforms');

class Organization {
    static addressSegment(organizationName) {
        const gap = 100;
        //Original source uses a number in the organizations' domain spec as the addressSegment.
        //This is based on name of the organizations. Should a user choose not to use org1 or org2 as names the code will break.
        //TODO: If this code is to be published and used this should be altered.
        return (parseInt(organizationName.split("-")[0].split("org")[1])) * gap;
    }

    static findVolumesAndVolumeMounts(organization, denominator, baseMountPath) {
        const volumes = [];
        const volumeMounts = [];

        organization.configMaps().forEach((configMap) => {
            const sourcePath = configMap.sourcePath();
            const pathSplit = sourcePath.split(denominator);
            if (pathSplit && pathSplit.length > 1) {
                const posixSubPath = KubernetesNaming.pathToPosixPath(pathSplit[1]);
                const mountPath = Path.posix.join(baseMountPath, posixSubPath);
                const volume = configMap.toVolume();
                volumes.push(volume);
                volumeMounts.push(volume.toVolumeMount(mountPath));
            }
        });

        return {
            volumes: volumes,
            volumeMounts: volumeMounts
        };
    }

    static minikubeSharedFolder(name) {
        const platform = Platforms.getHostPlatform();
        return Path.posix.join(platform.getVirtualBoxSharedFolder(), Path.basename(OS.homedir()), '.kubechain', 'fabric', name);
    }
}

module.exports = Organization;