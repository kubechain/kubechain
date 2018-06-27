import ConfigurationDirectory from "./configurationdirectory";
import OpaqueSecret from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/secret/opaquesecret";
import {directoryToOpaqueSecret} from "../../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/secret";
import {directoryToConfigMap} from "../../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/configmap";
import {namespacedUuid} from "../../../../../kubernetes-sdk/utilities/naming";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import * as Path from "path";

export default class Directory {
    private path: string;
    private relativePath: string;
    private name: string;

    constructor(path: string, relativePath: string) {
        this.path = path;
        this.relativePath = relativePath;
        this.name = this.relativePathToDirectoryName();
    }

    private relativePathToDirectoryName(): string {
        return this.relativePath.replace(new RegExp('\\' + Path.sep, 'g'), '-');
    }

    convertToConfigMapDirectory(namespace: string): ConfigurationDirectory<ConfigMap> {
        const resource: ConfigMap = directoryToConfigMap(this.path, this.resourceName(namespace), namespace);
        if (resource) {
            return new ConfigurationDirectory<ConfigMap>(this.path, this.relativePath, resource)
        }
    }

    convertToOpaqueSecretDirectory(namespace: string): ConfigurationDirectory<OpaqueSecret> {
        const resource: OpaqueSecret = directoryToOpaqueSecret(this.path, this.resourceName(namespace), namespace);
        if (resource) {
            return new ConfigurationDirectory<OpaqueSecret>(this.path, this.relativePath, resource)
        }
    }

    private resourceName(namespace: string) {
        return namespacedUuid(this.name, namespace);
    }
}