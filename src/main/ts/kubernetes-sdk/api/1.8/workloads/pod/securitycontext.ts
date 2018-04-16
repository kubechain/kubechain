import IResource from "../../iresource";

export default class PodSecurityContext implements IResource {
    private fsGroup: number;
    private userId: number;

    setFsGroup(fsGroup: number) {
        this.fsGroup = fsGroup;
    }

    setUserId(userId: number) {
        this.userId = userId;
    }

    toJson(): any {
        return {
            "fsGroup": this.fsGroup,
            "runAsUser": this.userId
        };
    }

}