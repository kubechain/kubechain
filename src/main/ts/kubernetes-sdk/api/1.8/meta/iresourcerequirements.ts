import IResource from "../iresource";

export default interface IResourceRequirements extends IResource {
    setLimits(limits: any): void;

    setRequests(requests: any): void;
}