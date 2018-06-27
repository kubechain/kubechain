import ConfigurationDirectory from "./configurationdirectory";
import IVolumeSource from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/volumesources/ivolumesource";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";

export default class ConfigurationDirectoryTree<T extends IVolumeSource> {
    private rootPath: string;
    private directories: ConfigurationDirectory<T>[];

    constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.directories = [];
    }

    add(directory: ConfigurationDirectory<T>) {
        this.directories.push(directory);
    }

    findDirectoriesForRelativePath(path: string): ConfigurationDirectory<T>[] {
        const directories: ConfigurationDirectory<T>[] = [];
        this.directories.forEach((directory: ConfigurationDirectory<T>) => {
            if (directory.relativePathMatches(path)) {
                directories.push(directory);
            }
        });
        return directories;
    }

    findSubDirectoriesForRelativePath(path: string): ConfigurationDirectory<T>[] {
        const directories: ConfigurationDirectory<T>[] = [];
        this.directories.forEach((directory: ConfigurationDirectory<T>) => {
            if (directory.relativePathMatches(path) || directory.relativeSubPathMatches(path)) {
                directories.push(directory);
            }
        });
        return directories;
    }

    findDirectoriesForAbsolutePath(path: string): ConfigurationDirectory<T>[] {
        const directories: ConfigurationDirectory<T>[] = [];
        this.directories.forEach((directory: ConfigurationDirectory<T>) => {
            if (directory.absolutePathMatches(path)) {
                directories.push(directory);
            }
        });
        return directories;
    }

    mountAllWithRelativePath(container: IContainer, baseMountPath: string): void {
        this.directories.forEach((directory: ConfigurationDirectory<T>) => {
            directory.mountWithRelativePath(container, baseMountPath);
        });
    }

    addAllAsVolume(spec: IPodSpec) {
        this.directories.forEach((directory: ConfigurationDirectory<T>) => {
            directory.addAsVolume(spec);
        });
    }

    getAll(): ConfigurationDirectory<T>[] {
        return this.directories;
    }
}