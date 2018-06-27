import * as Path from 'path';
import {parseDirectoryTree} from "../../../../../util";
import ConfigurationDirectoryTree from "./configurationdirectorytree";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import OpaqueSecret from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/secret/opaquesecret";
import Directory from "./directory";

export default class DirectoryTree {
    private path: string;

    constructor(path: string) {
        this.path = path;
    }

    convertToConfigMapDirectoryTree(namespace: string): ConfigurationDirectoryTree<ConfigMap> {
        const directoryTree = new ConfigurationDirectoryTree<ConfigMap>(this.path);
        parseDirectoryTree(this.path, this.path, (directoryPath: string) => {
            const directory = new Directory(directoryPath, this.directoryRelativePath(directoryPath));
            const configurationDirectory = directory.convertToConfigMapDirectory(namespace);
            if (configurationDirectory) {
                directoryTree.add(configurationDirectory);
            }
        });

        return directoryTree;
    }

    convertToOpaqueSecretDirectoryTree(namespace: string): ConfigurationDirectoryTree<OpaqueSecret> {
        const directoryTree = new ConfigurationDirectoryTree<OpaqueSecret>(this.path);
        parseDirectoryTree(this.path, this.path, (directoryPath: string) => {
            const directory = new Directory(directoryPath, this.directoryRelativePath(directoryPath));
            const configurationDirectory = directory.convertToOpaqueSecretDirectory(namespace);
            if (configurationDirectory) {
                directoryTree.add(configurationDirectory);
            }
        });

        return directoryTree;
    }

    private directoryRelativePath(directoryPath: string) {
        return Path.relative(this.path, directoryPath) || Path.basename(this.path);
    }
}