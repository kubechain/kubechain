import IResource from "../../iresource";

export default interface IConfigurationResource extends IResource {
    addDataPair(key: string, value: any): void;
}