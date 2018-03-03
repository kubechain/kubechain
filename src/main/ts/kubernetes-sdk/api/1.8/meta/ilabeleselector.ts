import IResource from "../iresource";

export default interface ILabelSelector extends IResource {
    addMatchLabel(key: any, value: any): void;
}