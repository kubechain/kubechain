import IResource from "../../../../iresource";

export default class KeyToPath implements IResource {
    private key: string;
    private mode: string;
    private path: string;

    constructor(key: string, path: string) {
        this.key = key;
        this.path = path;
    }

    toJson(): any {
        return {
            "key": this.key,
            "path": this.path,
            "mode": this.mode
        };
    }
}