import IArchitecture from "./iarchitecture";
import Architecture from './architecture';

export default class Ppc64 implements IArchitecture {
    private architecture: Architecture;
    constructor() {
        this.architecture = new Architecture('ppc64');
    }

    equalsHostArchitecture(): boolean {
        return this.architecture.equalsHostArchitecture();
    }

    name() {
        return 'ppc64le';
    }
}