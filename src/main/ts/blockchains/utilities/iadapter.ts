export default interface IAdapter {
    start(): any;

    matchesBlockchainTarget(target: string): boolean;

    matchesKubernetesTarget(target: string): boolean;
}