import IResource from "../../../../../iresource";

export default interface IHostPathVolumeSource extends IResource {

    setHostPath(hostPath: string): void;

}