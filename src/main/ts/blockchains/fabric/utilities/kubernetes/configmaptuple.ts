import * as Path from "path";
import ConfigMap from "../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import IContainer from "../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import * as Naming from "../../../../kubernetes-sdk/utilities/naming";
import IPodSpec from "../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";

export default class ConfigMapTuple {
    private absolutePath: string;
    private relativePath: string;
    private configMap: ConfigMap;

    constructor(absolutePath: string, relativePath: string, configMap: ConfigMap) {
        this.absolutePath = absolutePath;
        this.relativePath = relativePath;
        this.configMap = configMap;
    }

    relativePathMatches(relativePath: string): boolean {
        return this.relativePath === relativePath;
    }

    relativeSubPathMatches(relativePath: string) {
        this.relativePath.split(relativePath);
        return this.isSubPath(relativePath, this.relativePath);
    }

    private isSubPath(path: string, potentialSubPath: string) {
        const subPathSplit = potentialSubPath.split(path);
        return subPathSplit && subPathSplit.length > 1;
    }

    absolutePathMatches(absolutePath: string): boolean {
        if (this.matchesAbsolutePathExactly(absolutePath)) {
            return true
        }
        else {
            const relativePathSplit = this.absolutePath.split(absolutePath + Path.sep);
            if (relativePathSplit && relativePathSplit.length > 1) {
                const relativePath = relativePathSplit[1];
                return relativePath === this.relativePath;
            }
            else {
                return false
            }
        }
        // const relativePathSplit = this.absolutePath.split(absolutePath + Path.sep); //TODO: Fix this Path.sep.
        // console.warn(absolutePath, this.absolutePath, relativePathSplit);
        // if (relativePathSplit && relativePathSplit.length > 1) {
        //     const relativePath = relativePathSplit[1];
        //     return relativePath === this.relativePath;
        // }
        // return false;
    }

    private matchesAbsolutePathExactly(path: string) {
        return path === this.absolutePath;
    }

    addConfigMapAsRelativeVolumeMount(container: IContainer, baseMountPath: string) {
        const mountPath = Path.posix.join(baseMountPath, Naming.pathToPosixPath(this.relativePath));
        container.addVolumeMount(this.configMap.toVolume().toVolumeMount(mountPath));
    }

    addConfigMapAsVolumeMount(container: IContainer, mountPath: string) {
        container.addVolumeMount(this.configMap.toVolume().toVolumeMount(mountPath));
    }

    addAsVolume(spec: IPodSpec) {
        spec.addVolume(this.configMap.toVolume());
    }

    getConfigMap(): ConfigMap {
        return this.configMap;
    }
}