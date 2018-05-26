import IResource from "../../iresource";

export default class PodSecurityContext implements IResource {
    private fsGroup: number;
    private userId: number;
    private privileged: boolean;

    setFsGroup(fsGroup: number) {
        this.fsGroup = fsGroup;
    }

    setUserId(userId: number) {
        this.userId = userId;
    }

    setPrivileged(privileged: boolean) {
        this.privileged = privileged;
    }

    toJson(): any {
        return {
            "fsGroup": this.fsGroup,
            "runAsUser": this.userId,
            "privileged": this.privileged
        };
    }

}