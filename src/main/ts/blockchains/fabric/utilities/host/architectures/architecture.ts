import * as OS from 'os';
import IArchitecture from "./iarchitecture";

export default class Architecture implements IArchitecture {
    private architecture: string;

    constructor(architecture: string) {
        this.architecture = architecture;
    }

    equalsHostArchitecture(): boolean {
        return this.architecture === OS.arch();
    }

    name() {
        return this.architecture;
    }
}