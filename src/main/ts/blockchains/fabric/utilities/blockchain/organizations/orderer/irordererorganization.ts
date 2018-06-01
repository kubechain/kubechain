import ResourceWriter from "../../resourcewriter/resourcewriter";
import IOrganization from "../iorganization";
import IGenesisBlockCollector from "./entities/igenesisblockcollector";

export default interface IOrdererOrganization extends IOrganization, IGenesisBlockCollector {

    addResources(writer: ResourceWriter): void;

}
