import IPersistentVolumeClaimSpec from "./ipersistentvolumeclaimspec";
import IResourceRequirements from "../../../meta/iresourcerequirements";
import ILabelSelector from "../../../meta/ilabeleselector";
import LabelSelector from "../../../meta/labelselector";
import ResourceRequirements from "../../../meta/resourcerequirements";

export default class PersistentVolumeClaimSpec implements IPersistentVolumeClaimSpec, ILabelSelector {
    private accessModes: Array<string>;
    private resourceRequirements: IResourceRequirements;
    private labelSelector: LabelSelector;
    private storageClassName: string;
    private volumeName: string;

    constructor() {
        this.accessModes = [];
        this.labelSelector = new LabelSelector();
        this.resourceRequirements = new ResourceRequirements();
    }

    addAccessMode(mode: string): void {
        this.accessModes.push(mode);
    }

    setResourceRequirements(resourceRequirements: IResourceRequirements) {
        this.resourceRequirements = resourceRequirements;
    }

    addMatchLabel(key: any, value: any): void {
        this.labelSelector.addMatchLabel(key, value);
    }

    setStorageClassName(storageClassName: string): void {
        this.storageClassName = storageClassName;
    }

    setVolumeName(volumeName: string): void {
        this.volumeName = volumeName;
    }

    toJson(): any {
        return {
            "accessModes": this.accessModes,
            "resources": this.resourceRequirements.toJson(),
            "selector": this.labelSelector.toJson(),
            "storageClassName": this.storageClassName,
            "volumeName": this.volumeName
        };
    }
}