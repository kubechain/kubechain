import KubechainTargets from "../../kubechain/targets";
import Kubechain from "../../kubechain/kubechain";

export default interface IAdapter {
    start(kubechain: Kubechain): any;

    matchesTargets(targets: KubechainTargets): boolean;
}