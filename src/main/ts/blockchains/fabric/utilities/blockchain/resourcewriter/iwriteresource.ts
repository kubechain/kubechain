import IResource from "../../../../../kubernetes-sdk/api/1.8/iresource";

export default interface WriteResource {
    path: string
    name: string
    resource: IResource
}