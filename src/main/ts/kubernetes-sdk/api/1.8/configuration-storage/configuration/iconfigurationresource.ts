import IResource from "../../iresource";
import Iconfigurationvolumesource from "../storage/volumes/volumesources/configuration/iconfigurationvolumesource";
import IVolumeSource from "../storage/volumes/volumesources/ivolumesource";

export default interface IConfigurationResource extends IResource, Iconfigurationvolumesource, IVolumeSource {
    addDataPair(key: string, value: any): void;
}