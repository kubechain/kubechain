import ChainConfigurationCreator from "./blockchain/configuration/create";
import IAdapter from "../utilities/iadapter";
import MinikubeAdapter from "./adapters/minikube/adapter";
import KubechainTargets from "../../kubechain/targets";
import GceAdapter from "./adapters/gce/adapter";
import Kubechain from "../../kubechain/kubechain";

export default class ConfigurationCreator implements IAdapter {
    private adapters: IAdapter[];
    private kubechain: Kubechain;

    constructor(kubechain: Kubechain) {
        this.kubechain = kubechain;
        this.adapters = [new MinikubeAdapter(kubechain), new GceAdapter(kubechain)];
    }

    async start(kubechain: Kubechain) {
        try {
            await new ChainConfigurationCreator().create(kubechain);
            const adapter = this.getAdapter();
            await adapter.start(kubechain);
            return Promise.resolve();
        }
        catch (e) {
            console.error("Unable to create complete fabric configuration.");
            console.error("Reason:", e);
        }
    }

    matchesTargets(targets: KubechainTargets): boolean {
        return this.targetsMatchOneOfAdapters(targets);
    }

    private targetsMatchOneOfAdapters(targets: KubechainTargets) {
        for (let i = 0; i < this.adapters.length; i++) {
            const adapter = this.adapters[i];
            if (adapter.matchesTargets(targets)) {
                return true;
            }
        }

        return false;
    }

    private getAdapter(): IAdapter {
        let targetAdapter = undefined;
        this.adapters.forEach((adapter: IAdapter) => {
            if (adapter.matchesTargets(this.kubechain.get('$.targets'))) {
                targetAdapter = adapter;
            }
        });
        return targetAdapter;
    }
}