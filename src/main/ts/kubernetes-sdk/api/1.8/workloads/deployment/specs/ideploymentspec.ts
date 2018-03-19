import IResource from "../../../iresource";
import ILabelSelector from "../../../meta/ilabeleselector";
import IPodSpec from "../../pod/ipodspec";

export default interface IDeploymentSpec extends IResource, ILabelSelector, IPodSpec {

    setAmountOfReplicas(amount: number): void;

}