import ResourceWriter from "../../resourcewriter/resourcewriter";
import IPodSpec from "../../../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IOrganization from "../iorganization";
import IGenesisBlockCollector from "./entities/igenesisblockcollector";

export default interface IOrdererOrganization extends IOrganization, IGenesisBlockCollector {

    addResources(writer: ResourceWriter): void;

}
