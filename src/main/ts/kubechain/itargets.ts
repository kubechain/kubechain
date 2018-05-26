export default interface ITargets {
    matchesBlockchainTarget(target: string): boolean;

    matchesKubernetesTarget(target: string): boolean;
}
