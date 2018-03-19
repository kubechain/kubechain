import IAdapter from "../utilities/iadapter";
import MinikubeAdapter from "./adapters/minikube/minikube";
import ConfigurationAdapter from "./blockchain/configuration/create";

export default class BurrowConfigurationCreator implements IAdapter {
    private adapters: IAdapter[];
    private kubernetesTarget: string;

    constructor(kubernetesTarget: string) {
        this.adapters = [new MinikubeAdapter()];
        this.kubernetesTarget = kubernetesTarget;
    }

    start() {
        const configurationAdapter = new ConfigurationAdapter();
        configurationAdapter.create();
        const kubernetesAdapter = this.getKubernetesAdapter(this.kubernetesTarget);
        kubernetesAdapter.start();
    }

    matchesBlockchainTarget(target: string): boolean {
        return target === 'burrow';
    }

    matchesKubernetesTarget(target: string): boolean {
        return this.targetMatchesOneOfAdapters(target);
    }

    private targetMatchesOneOfAdapters(target: string) {
        let matches = false;
        this.adapters.forEach((adapter: IAdapter) => {
            if (adapter.matchesKubernetesTarget(target)) {
                matches = true;
            }
        });
        return matches;
    }

    private getKubernetesAdapter(target: string): IAdapter {
        let targetAdapter = undefined;
        this.adapters.forEach((adapter: IAdapter) => {
            if (adapter.matchesKubernetesTarget(target)) {
                targetAdapter = adapter;
            }
        });
        return targetAdapter;
    }
}