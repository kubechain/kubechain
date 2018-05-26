import ResourceWriter from "../../../../resourcewriter/resourcewriter";
import IPodSpec from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IContainer from "../../../../../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IGenesisBlockCollector from "../igenesisblockcollector";

export default interface IOrderer extends IGenesisBlockCollector {
    addResources(writer: ResourceWriter, outputPath: string): void;

    addVolume(spec: IPodSpec): void;

    mountMsp(container: IContainer, mountPath: string): void;

    mountTls(container: IContainer, mountPath: string): void;
}