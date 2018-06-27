import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import ResourceWriter from "../resourcewriter/resourcewriter";
import DirectoryTree from "../../kubernetes/directorytree/directorytree";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import ConfigurationCollector from "../configurationcollector";
import IMountable from "../mountable";

export default class ChainCode implements IMountable {
    private configurationCollector: ConfigurationCollector<ConfigMap>;

    constructor(hostPath: string, organizationNamespace: string) {
        const directoryTree = new DirectoryTree(hostPath);
        const configurationDirectoryTree = directoryTree.convertToConfigMapDirectoryTree(organizationNamespace);
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