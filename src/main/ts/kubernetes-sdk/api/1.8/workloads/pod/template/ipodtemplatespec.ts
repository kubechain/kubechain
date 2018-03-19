import IResource from "../../../iresource";
import IPodSpec from "../ipodspec";

export default interface IPodTemplateSpec extends IResource, IPodSpec {
    addLabel(key: string, value: any): void;
}