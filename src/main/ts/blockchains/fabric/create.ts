import ChainConfigurationCreator from "./blockchain/configuration/create";
import IAdapter from "../utilities/iadapter";
import MinikubeAdapter from "./adapters/minikube/minikube";

export default class ConfigurationCreator implements IAdapter {
    private adapters: IAdapter[];
    private kubernetesTarget: string;

    constructor(kubernetesTarget: string) {
        this.adapters = [new MinikubeAdapter()];
        this.kubernetesTarget = kubernetesTarget;
    }

    async start() {
        try {
            await new ChainConfigurationCreator().create();
            const adapter = this.getAdapter(this.kubernetesTarget);
            await adapter.start();
            return Promise.resolve();
        }
        catch (e) {
            console.error("Unable to create complete fabric configuration.");
            console.error("Reason:", e);
        }
    }

    matchesBlockchainTarget(target: string): boolean {
        return target === 'fabric';
    }

    matchesKubernetesTarget(target: string): boolean {
        return this.targetMatchesOneOfAdapters(target);
    }

    targetMatchesOneOfAdapters(target: string) {
        let matches = false;
        this.adapters.forEach((adapter: IAdapter) => {
            if (adapter.matchesKubernetesTarget(target)) {
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

    async create() {

    }
}