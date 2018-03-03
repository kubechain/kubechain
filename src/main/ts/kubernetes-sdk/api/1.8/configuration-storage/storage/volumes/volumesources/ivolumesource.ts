import IVolume from "../ivolume";

export default interface IVolumeSource {
    toVolume(): IVolume;
}