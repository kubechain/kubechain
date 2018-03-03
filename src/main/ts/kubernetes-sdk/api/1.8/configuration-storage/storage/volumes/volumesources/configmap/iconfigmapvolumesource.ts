import KeyToPath from "../keytopath";

export default interface IConfigMapVolumeSource {
    addItem(item: KeyToPath): void;
}