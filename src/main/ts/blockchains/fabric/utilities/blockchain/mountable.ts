import IContainer from "../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import IPodSpec from "../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import ResourceWriter from "./resourcewriter/resourcewriter";

export default interface IMountable {
    mount(container: IContainer, mountPath: string): void;

    addAsVolume(spec: IPodSpec): void;

    addToWriter(writer: ResourceWriter, path: string): void;
}