import KubechainTargets from "../../targets";

export default interface IAdapter {
    start(targets: KubechainTargets): any;

    matchesBlockchainTarget(target: string): boolean;

    matchesKubernetesTarget(target: string): boolean;

    matchesTargets(targets: KubechainTargets): boolean;
}