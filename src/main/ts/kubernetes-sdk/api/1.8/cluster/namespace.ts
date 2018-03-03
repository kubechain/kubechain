import IResource from "../iresource";

export default class Namespace implements IResource {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    toJson() {
        return {
            "apiVersion": "v1",
            "kind": "Namespace",
            "metadata":
                {"name": this.name}
        }
    }
}