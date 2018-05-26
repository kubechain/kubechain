import IVolume from "../../storage/volumes/ivolume";
import KeyToPath from "../../storage/volumes/volumesources/keytopath";
import Secret from "./secret";
import IConfigurationResource from "../iconfigurationresource";

export default class OpaqueSecret implements IConfigurationResource {
    private secret: Secret;

    constructor(name: string, namespace: string) {
        this.secret = new Secret(name, namespace, "Opaque");
    }

    addDataPair(key: string, value: Buffer): void {
        this.secret.addDataPair(key, value);
    }

    addItem(item: KeyToPath): void {
        this.secret.addItem(item);
    }

    toVolume(): IVolume {
        return this.secret.toVolume();
    }

    toJson(): any {
        return this.secret.toJson();
    }
}