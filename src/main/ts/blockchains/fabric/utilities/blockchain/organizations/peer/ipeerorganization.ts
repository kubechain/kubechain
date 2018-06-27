import Channel from "../../channel/channel";
import ResourceWriter from "../../resourcewriter/resourcewriter";
import ConfigMap from "../../../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap";
import ChainCode from "../../chaincode/chaincode";
import ConfigurationDirectoryTreeVolumes from "../../volumes/configurationdirectorytreevolumes";

export default interface IPeerOrganization {

    createCryptographicMaterial(hostPath: string, namespace: string): ConfigurationDirectoryTreeVolumes<ConfigMap>

    createChannels(writer: ResourceWriter, namespace: string, outputPath: string): Channel[];

    createChainCodes(writer: ResourceWriter, namespace: string, outputPath: string): ChainCode[]
}