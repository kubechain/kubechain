import IKind from "../ikind";

export default class Job implements IKind {
    toPlural(): string {
        return "Job";
    }

    toString() {
        return "Job";
    }
}