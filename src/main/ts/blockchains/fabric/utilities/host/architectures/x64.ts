import IArchitecture from "./iarchitecture";
import Architecture from "./architecture";

export default class X64 implements IArchitecture {
    private architecture: Architecture;
    constructor() {
        this.architecture = new Architecture('x64')
    }

    equalsHostArchitecture(): boolean {
        return this.architecture.equalsHostArchitecture();
    }

    name() {
        return 'amd64';
    }
}