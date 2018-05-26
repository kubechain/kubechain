export default interface IWorkloadHooks {
    created(data: any): void;

    createdConfiguration(data: any): void;

    beforeCreate(data: any): void;

    beforeWrite(data: any): void;
}