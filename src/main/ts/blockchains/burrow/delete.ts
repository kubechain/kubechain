import ChainConfigurationDeleter from "./blockchain/configuration/delete";
import KubernetesConfigurationDeleter from "./kubernetes/configuration/delete";
import ICommandExecutor from "../utilities/icommandexecutor";
import Kubechain from "../../kubechain/kubechain";

export default class ConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'burrow';
    }

    delete(kubechain: Kubechain) {
        new ChainConfigurationDeleter().delete(kubechain);
        new KubernetesConfigurationDeleter().delete(kubechain);
    }
}