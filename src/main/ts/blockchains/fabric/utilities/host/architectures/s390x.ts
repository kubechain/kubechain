import IArchitecture from "./iarchitecture";
import Architecture from "./architecture";


export default class S390x implements IArchitecture {
    private architecture: Architecture;
    constructor() {
        this.architecture = new Architecture('s390x');
    }

    equalsHostArchitecture(): boolean {
        return this.architecture.equalsHostArchitecture();
    }

    name(): string {
        return this.architecture.name();
    }

}