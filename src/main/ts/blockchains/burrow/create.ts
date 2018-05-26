import IAdapter from "../utilities/iadapter";
import MinikubeAdapter from "./adapters/minikube/adapter";
import ChainConfigurationCreator from "./blockchain/configuration/create";
import GceAdapter from "./adapters/gce/adapter";
import KubechainTargets from "../../kubechain/targets";
import Kubechain from "../../kubechain/kubechain";
import IHooks from "../utilities/iadapterhooks";

export default class BurrowConfigurationCreator implements IAdapter {
    private adapters: IAdapter[];
    private kubechain: Kubechain;

    constructor(kubechain: Kubechain) {
        this.kubechain = kubechain;
        this.adapters = [new MinikubeAdapter(kubechain), new GceAdapter(kubechain)];
    }

    matchesTargets(targets: KubechainTargets): boolean {
        return this.targetsMatchOneOfAdapters(targets);
    }

    start(kubechain: Kubechain) {
        const configurationAdapter = new ChainConfigurationCreator();
        configurationAdapter.create(kubechain);
        const kubernetesAdapter = this.getAdapter(this.kubechain.get('$.targets'));
        kubernetesAdapter.start(kubechain);
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