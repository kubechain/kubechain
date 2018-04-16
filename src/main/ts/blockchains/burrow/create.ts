import IAdapter from "../utilities/iadapter";
import MinikubeAdapter from "./adapters/minikube/adapter";
import ChainConfigurationCreator from "./blockchain/configuration/create";
import GceAdapter from "./adapters/gce/adapter";
import KubechainTargets from "../../targets";

export default class BurrowConfigurationCreator implements IAdapter {
    private adapters: IAdapter[];

    constructor() {
        this.adapters = [new MinikubeAdapter(), new GceAdapter()];
    }

    start(targets: KubechainTargets) {
        const configurationAdapter = new ChainConfigurationCreator();
        configurationAdapter.create(targets);
        const kubernetesAdapter = this.getAdapter(targets.kubernetes.name);
        kubernetesAdapter.start(targets);
    }

    matchesBlockchainTarget(target: string): boolean {
        return target === 'burrow';
    }

    matchesKubernetesTarget(target: string): boolean {
        return this.targetMatchesOneOfAdapters(target);
    }

    matchesTargets(targets: KubechainTargets): boolean {
        return this.targetsMatchOneOfAdapters(targets);
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

    private targetsMatchOneOfAdapters(target: KubechainTargets) {
        let matches = false;
        this.adapters.forEach((adapter: IAdapter) => {
            if (adapter.matchesTargets(target)) {
                matches = true;
            }
        });
        return matches;
    }

    private getAdapter(target: string): IAdapter {
        let targetAdapter = undefined;
        this.adapters.forEach((adapter: IAdapter) => {
            if (adapter.matchesKubernetesTarget(target)) {
                targetAdapter = adapter;
            }
        });
        return targetAdapter;
    }
}