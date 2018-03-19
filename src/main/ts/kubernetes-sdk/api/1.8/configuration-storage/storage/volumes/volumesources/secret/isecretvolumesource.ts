import KeyToPath from "../keytopath";

export default interface ISecretVolumeSource {
    addItem(item: KeyToPath): void;
}