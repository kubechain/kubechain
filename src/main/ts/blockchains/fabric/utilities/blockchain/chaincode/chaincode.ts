import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IChainCode from "./options";
import ResourceWriter from "../resourcewriter/resourcewriter";
import {directoryTreeToConfigMapDirectoryTree} from "../../kubernetes/files/files";
import ConfigMap from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import ConfigurationCollector from "../configurationcollector";

export default class ChainCode {
    private configurationCollector: ConfigurationCollector<ConfigMap>;

    constructor(chainCode: IChainCode, organizationNamespace: string) {
        const sourceCodeDirectoryTree = directoryTreeToConfigMapDirectoryTree(chainCode.path, organizationNamespace);
        const sourceCodeDirectories = sourceCodeDirectoryTree.findDirectoriesForAbsolutePath(chainCode.path);
        this.configurationCollector = new ConfigurationCollector(sourceCodeDirectories);
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