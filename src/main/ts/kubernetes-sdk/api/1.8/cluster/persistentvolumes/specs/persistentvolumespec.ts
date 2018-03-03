import IPersistentVolumeSpec from "./ipersistentvolumespec";

export default class PersistentVolumeSpec implements IPersistentVolumeSpec {
    private accessModes: Array<string>;
    private capacity: object;
    private storageClassName: string;

    constructor() {
        this.accessModes = [];
    }

    addAccessMode(accessMode: string): void {
        this.accessModes.push(accessMode);
    }

    setCapacity(capacity: object): void {
        this.capacity = capacity;
    }

    setStorageClassName(storageClassName: string): void {
        this.storageClassName = storageClassName;
    }

    toJson(): any {
        return {
            "accessModes": this.accessModes,
            "capacity": this.capacity,
            "storageClassName": this.storageClassName
        };
    }

}