import ConfigurationDirectory from "./configurationdirectory";
import IVolumeSource from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/volumes/volumesources/ivolumesource";

export default class ConfigurationDirectoryTree<T extends IVolumeSource> {
    private rootPath: string;
    private directories: ConfigurationDirectory<T>[];

    constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.directories = [];
    }

    add(configMapTuple: ConfigurationDirectory<T>) {
        this.directories.push(configMapTuple);
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
}