import IResource from "../../../../../iresource";

export default interface IAwsElasticBlockStore extends IResource {

    setFsType(fsType: string): void;

    setPartition(partition: number): void;

    setReadOnly(readOnly: boolean): void;
}