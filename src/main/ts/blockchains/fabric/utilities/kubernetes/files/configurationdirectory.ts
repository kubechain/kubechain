import * as Path from "path";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import * as Naming from "../../../../../kubernetes-sdk/utilities/naming";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IVolumeSource from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/volumesources/ivolumesource";

export default class ConfigurationDirectory<T extends IVolumeSource> {
    private absolutePath: string;
    private relativePath: string;
    private resource: T;

    constructor(absolutePath: string, relativePath: string, configMap: T) {
        this.absolutePath = absolutePath;
        this.relativePath = relativePath;
        this.resource = configMap;
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
    }

    private matchesAbsolutePathExactly(path: string) {
        return path === this.absolutePath;
    }

    mountWithRelativePath(container: IContainer, baseMountPath: string) {
        const mountPath = Path.posix.join(baseMountPath, Naming.pathToPosixPath(this.relativePath));
        container.addVolumeMount(this.resource.toVolume().toVolumeMount(mountPath));
    }

    mount(container: IContainer, mountPath: string) {
        container.addVolumeMount(this.resource.toVolume().toVolumeMount(mountPath));
    }

    addAsVolume(spec: IPodSpec) {
        spec.addVolume(this.resource.toVolume());
    }

    getDirectoryResource(): T {
        return this.resource;
    }
}