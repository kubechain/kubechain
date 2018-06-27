import IMountable from "../mountable";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import ResourceWriter from "../resourcewriter/resourcewriter";
import ConfigurationCollector from "../configurationcollector";
import IConfigurationResource from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/iconfigurationresource";
import DirectoryTree from "../../kubernetes/directorytree/directorytree";

export default class CryptographicMaterial implements IMountable {
    private configurationCollector: ConfigurationCollector<IConfigurationResource>;

    constructor(hostPath: string, namespace: string) {
        const directoryTree = new DirectoryTree(hostPath);
        const configurationDirectoryTree = directoryTree.convertToConfigMapDirectoryTree(namespace);
        const directories = configurationDirectoryTree.findDirectoriesForAbsolutePath(hostPath);
        this.configurationCollector = new ConfigurationCollector(directories);
    }

    mount(container: IContainer, mountPath: string) {
        this.configurationCollector.mount(container, mountPath);
    }

    addAsVolume(spec: IPodSpec) {
        this.configurationCollector.addAsVolume(spec);
    }

    addToWriter(writer: ResourceWriter, path: string) {
        this.configurationCollector.addToWriter(writer, path);
    }

}