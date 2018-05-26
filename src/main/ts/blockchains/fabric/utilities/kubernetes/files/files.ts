import * as Path from 'path';
import {
    directoryToConfigMap
} from "../../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/configmap";
import {parseDirectoryTree} from "../../../../../util";
import ConfigurationDirectoryTree from "./configurationdirectorytree";
import ConfigurationTuple from "./configurationdirectory";
import {namespacedUuid} from "../../../../../kubernetes-sdk/utilities/naming";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import OpaqueSecret from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/secret/opaquesecret";
import {directoryToOpaqueSecret} from "../../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/secret";

function directoryTreeToConfigMapDirectoryTree(rootPath: string, namespace: string): ConfigurationDirectoryTree<ConfigMap> {
    const tuples = new ConfigurationDirectoryTree<ConfigMap>(rootPath);
    parseDirectoryTree(rootPath, rootPath, (nodePath: string) => {
        const relativepathToRootPath = Path.relative(rootPath, nodePath) || Path.basename(rootPath);
        const name = relativepathToRootPath.replace(new RegExp('\\' + Path.sep, 'g'), '-');
        const configMap: ConfigMap = directoryToConfigMap(nodePath, namespacedUuid(name, namespace), namespace);
        if (configMap) {
            tuples.add(new ConfigurationTuple<ConfigMap>(nodePath, relativepathToRootPath, configMap));
        }
    });

    return tuples;
}

function directoryTreeToOpaqueSecretDirectoryTree(rootPath: string, namespace: string): ConfigurationDirectoryTree<OpaqueSecret> {
    const tuples = new ConfigurationDirectoryTree<OpaqueSecret>(rootPath);
    parseDirectoryTree(rootPath, rootPath, (nodePath: string) => {
        const relativepathToRootPath = Path.relative(rootPath, nodePath) || Path.basename(rootPath);
        const name = relativepathToRootPath.replace(new RegExp('\\' + Path.sep, 'g'), '-');
        const opaqueSecret: OpaqueSecret = directoryToOpaqueSecret(nodePath, namespacedUuid(name, namespace), namespace);
        if (opaqueSecret) {
            tuples.add(new ConfigurationTuple<OpaqueSecret>(nodePath, relativepathToRootPath, opaqueSecret));
        }
    });

    return tuples;
}

export {directoryTreeToConfigMapDirectoryTree, directoryTreeToOpaqueSecretDirectoryTree}