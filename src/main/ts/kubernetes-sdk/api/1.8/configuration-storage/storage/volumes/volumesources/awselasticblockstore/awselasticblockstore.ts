import IResource from "../../../../../iresource";
import IAwsElasticBlockStore from "./iawselasticblockstore";

export default class AWSElasticBlockStoreVolumeSource implements IAwsElasticBlockStore {
    private fsType: string;
    private partition: number;
    private readOnly: boolean;
    private volumeId: string;

    constructor(volumeId: string) {
        this.volumeId = volumeId;
    }

    setFsType(fsType: string) {
        this.fsType = fsType;
    }

    setPartition(partition: number) {
        this.partition = partition;
    }

    setReadOnly(readOnly: boolean) {
        this.readOnly = readOnly;
    }

    toJson(): any {
        return {
            fsType: this.fsType,
            partition: this.partition,
            readOnly: this.readOnly,
            volumeID: this.volumeId
        };
    }
}