import ILabelSelector from "../../../meta/ilabeleselector";
import IPodTemplateSpec from "../../pod/template/ipodtemplatespec";

export default interface IJobSpec extends ILabelSelector, IPodTemplateSpec {
    setBackOffLimit(backOffLimit: number): void;
}