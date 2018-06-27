import IResource from "../../iresource";

export default class SecurityContext implements IResource {
    private privileged: boolean;

    setPrivileged(privileged: boolean) {
        this.privileged = privileged;
    }

    toJson(): any {
        return {
            privileged: this.privileged
        };
    }
}