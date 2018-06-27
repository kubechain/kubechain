import IWorkloadHooks from "./iworkloadhooks";

export default interface IHooks {
    createdRepresentations(data: any): void;

    createdWorkloads(data: any): void;

    beforeWrite(data: any): void;

    written(data: any): void;

    workload: IWorkloadHooks
}