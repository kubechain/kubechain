import IResourceRequirements from "./iresourcerequirements";

export default class ResourceRequirements implements IResourceRequirements {
    private limits: any;
    private requests: any;

    setLimits(limits: any) {
        this.limits = limits;
    }

    setRequests(requests: any) {
        this.requests = requests;
    }

    toJson(): any {
        return {
            "limits": this.limits,
            "requests": this.requests
        };
    }
}