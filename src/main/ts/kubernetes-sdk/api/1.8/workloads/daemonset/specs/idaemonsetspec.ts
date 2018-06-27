import IPodTemplateSpec from "../../pod/template/ipodtemplatespec";
import ILabelSelector from "../../../meta/ilabeleselector";

export default interface IDaemonSetSpec extends IPodTemplateSpec, ILabelSelector {

}