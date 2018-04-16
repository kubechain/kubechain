import ChainConfigurationCreator from "./blockchain/configuration/create";
import IAdapter from "../utilities/iadapter";
import MinikubeAdapter from "./adapters/minikube/adapter";
import KubechainTargets from "../../targets";
import GceAdapter from "./adapters/gce/adapter";

export default class ConfigurationCreator implements IAdapter {
    private adapters: IAdapter[];

    constructor() {
        this.adapters = [new MinikubeAdapter(), new GceAdapter()];
    }

    async start(targets: KubechainTargets) {
        try {
            await new ChainConfigurationCreator().create(targets);
            const adapter = this.getAdapter(targets);
            await adapter.start(targets);
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

    matchesTargets(targets: KubechainTargets): boolean {
        return this.targetsMatchOneOfAdapters(targets);
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

    private targetsMatchOneOfAdapters(target: KubechainTargets) {
        let matches = false;
        this.adapters.forEach((adapter: IAdapter) => {
            if (adapter.matchesTargets(target)) {
                matches = true;
            }
        });
        return matches;
    }

    private getAdapter(targets: KubechainTargets): IAdapter {
        let targetAdapter = undefined;
        this.adapters.forEach((adapter: IAdapter) => {
            if (adapter.matchesTargets(targets)) {
                targetAdapter = adapter;
            }
        });
        return targetAdapter;
    }
}