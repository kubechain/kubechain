import IResource from "../../iresource";

export default class VolumeMount implements IResource {
    private volumeName: string; // This must match the Name of a Volume.
    private mountPath: string; // Must not contain ':'
    private readOnly: boolean;
    private subPath: string;

    // Defaults to false.
    constructor(volumeName: string, mountPath: string,) {
        this.volumeName = volumeName;
        this.mountPath = mountPath;
    }

    setSubPath(subPath: string) {
        this.subPath = subPath;
    }

    toJson(): any {
        return {
            "name": this.volumeName,
            "mountPath": this.mountPath,
            "readOnly": this.readOnly,
            "subPath": this.subPath
        };
    }
}
//
// mountPath
// string 	Path within the container at which the volume should be mounted..
//     mountPropagation
// string 	mountPropagation determines how mounts are propagated from the host to container and the other way around. When not set, MountPropagationHostToContainer is used. This field is alpha in 1.8 and can be reworked or removed in a future release.
//     name
// string 	This must match the Name of a Volume.
//     readOnly
// boolean 	Mounted read-only if true, read-write otherwise (false or unspecified). Defaults to false.
//     subPath
// string 	Path within the volume from which the container's volume should be mounted. Defaults to "" (volume's root).