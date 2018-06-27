import IWorkloadHooks from "./workloadhooks";
import IHooks from "../../../utilities/iadapterhooks";

export default interface FabricHooks extends IHooks {
    creatingOrganization(data: any): void;

    createdCryptographicMaterial(data: any): void;

    createdChannels(data: any): void;

    createdRepresentations(data: any): void;

    beforeWrite(data: any): void;

    written(data: any): void;

    workload: IWorkloadHooks
}