import IPeerOrganization from "./ipeerorganization";
import * as Path from "path";
import ChannelOptions from "../../channel/options";
import Channel from "../../channel/channel";
import ResourceWriter from "../../resourcewriter/resourcewriter";
import Options from "../../../../options";
import ChainCode from "../../chaincode/chaincode";
import ChainCodeOptions from "../../chaincode/options";
import ConfigMap from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import IContainer from "../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IMountable from "../../mountable";
import IPodSpec from "../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import DirectoryTree from "../../../kubernetes/directorytree/directorytree";
import ConfigurationDirectoryTreeVolumes from "../../volumes/configurationdirectorytreevolumes";

export default class PeerOrganization implements IPeerOrganization {
    private options: Options;

    constructor(options: Options) {
        this.options = options;
    }

    createCryptographicMaterial(hostPath: string, namespace: string): ConfigurationDirectoryTreeVolumes<ConfigMap> {
        const directoryTree = new DirectoryTree(hostPath);
        const cryptographicMaterial = directoryTree.convertToConfigMapDirectoryTree(namespace);
        return new ConfigurationDirectoryTreeVolumes<ConfigMap>(cryptographicMaterial);
    }

    createChannels(writer: ResourceWriter, namespace: string, outputPath: string): Channel[] {
        const channels: Channel[] = [];
        const channelsOptions = this.options.get('$.options.channels') || [];
        channelsOptions.forEach((channelOptions: ChannelOptions) => {
            channelOptions.path = channelOptions.path || Path.join(this.options.get('$.blockchain.paths.channels'), channelOptions.name);
            const channel = new Channel(channelOptions.path, namespace);
            channel.addToWriter(writer, Path.join(outputPath, channelOptions.name));
            channels.push(channel);
        });
        return channels;
    }

    createChainCodes(writer: ResourceWriter, namespace: string, outputPath: string): ChainCode[] {
        const chainCodes: ChainCode[] = [];
        const chaincodesOptions = this.options.get('$.options.chaincodes') || [];
        chaincodesOptions.forEach((chainCodeOptions: ChainCodeOptions) => {
            const chainCode = this.createChainCode(chainCodeOptions, namespace);
            chainCode.addToWriter(writer, Path.join(outputPath, chainCodeOptions.id));
            chainCodes.push(chainCode);
        });
        return chainCodes;
    }

    createChainCode(chainCodeOptions: ChainCodeOptions, namespace: string): ChainCode {
        chainCodeOptions.path = chainCodeOptions.path || Path.join(this.options.get('$.blockchain.paths.chaincodes'), chainCodeOptions.id);
        const chainCode = new ChainCode(chainCodeOptions.path, namespace);
        return chainCode;
    }

    mountMountables(mountables: IMountable[], container: IContainer, mountPath: string) {
        mountables.forEach((mountable) => {
            mountable.mount(container, mountPath);
        });
    }

    addMountablesAsVolumes(mountables: IMountable[], spec: IPodSpec): void {
        mountables.forEach((mountable) => {
            mountable.addAsVolume(spec);
        })
    }
}