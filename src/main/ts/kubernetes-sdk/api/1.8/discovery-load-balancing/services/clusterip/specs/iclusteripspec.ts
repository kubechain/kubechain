import IServiceSpec from "../../specs/iservicespec";

export default interface IClusterIPServiceSpec extends IServiceSpec {
    setClusterIP(clusterIP: string): void;
}