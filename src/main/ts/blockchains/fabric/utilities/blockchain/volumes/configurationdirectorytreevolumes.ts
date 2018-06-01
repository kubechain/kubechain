import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import ConfigurationCollector from "../configurationcollector";
import ConfigurationDirectoryTree from "../../kubernetes/files/configurationdirectorytree";
import IConfigurationResource from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/iconfigurationresource";
import ResourceWriter from "../resourcewriter/resourcewriter";

export default class ConfigurationDirectoryTreeVolumes<T extends IConfigurationResource> {
    private directoryTree: ConfigurationDirectoryTree<T>;

    constructor(configurationDirectoryTree: ConfigurationDirectoryTree<T>) {
        this.directoryTree = configurationDirectoryTree;
    }

    findAndMount(searchPath: string, container: IContainer, mountPath: string): void {
        const directories = this.directoryTree.findSubDirectoriesForRelativePath(searchPath);
        const cryptographicMaterialCollector = new ConfigurationCollector(directories);
        cryptographicMaterialCollector.mount(container, mountPath);
    }

    findAndAddAsVolumes(searchPath: string, spec: IPodSpec): void {
        const directories = this.directoryTree.findSubDirectoriesForRelativePath(searchPath);
        const cryptographicMaterialCollector = new ConfigurationCollector(directories);
        cryptographicMaterialCollector.addAsVolume(spec);
    }

    findAndAddToWriter(searchPath: string, writer: ResourceWriter, outputPath: string) {
        const configurationDirectories = this.directoryTree.findDirectoriesForAbsolutePath(searchPath);
        const cryptographicMaterialCollector = new ConfigurationCollector(configurationDirectories);
        cryptographicMaterialCollector.addToWriter(writer, outputPath)
    }
}