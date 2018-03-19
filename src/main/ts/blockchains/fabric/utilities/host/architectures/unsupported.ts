import IArchitecture from "./iarchitecture";
import Architecture from "./architecture";

export default class Unsupported implements IArchitecture {
    private architecture: Architecture;
    constructor() {
        this.architecture = new Architecture('unsupported')
    }

    equalsHostArchitecture(): boolean {
        return this.architecture.equalsHostArchitecture();
    }

    name(): string {
        return this.architecture.name();
    }
}