import KeyToPath from "../keytopath";
import IVolumeSource from "../ivolumesource";

export default interface IConfigurationVolumeSource {
    addItem(item: KeyToPath): void;
}