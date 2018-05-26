import IChannel from "./options";
import IContainer from "../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import ResourceWriter from "../resourcewriter/resourcewriter";
import {directoryTreeToOpaqueSecretDirectoryTree} from "../../kubernetes/files/files";
import OpaqueSecret from "../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/secret/opaquesecret";
import ConfigurationCollector from "../configurationcollector";

export default class Channel {
    private channel: IChannel;
    private configurationCollector: ConfigurationCollector<OpaqueSecret>;

    constructor(channel: IChannel, organizationNamespace: string) {
        this.channel = channel;
        const transactionDirectoryTree = directoryTreeToOpaqueSecretDirectoryTree(channel.path, organizationNamespace);
        const transactionDirectories = transactionDirectoryTree.findDirectoriesForAbsolutePath(this.channel.path);
        this.configurationCollector = new ConfigurationCollector(transactionDirectories);
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