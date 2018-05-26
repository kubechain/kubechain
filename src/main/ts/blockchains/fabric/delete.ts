import KubernetesConfigurationDeleter from "./kubernetes/configuration/delete";
import ICommandExecutor from "../utilities/icommandexecutor";
import ChainConfigurationDeleter from "./blockchain/configuration/delete";
import Kubechain from "../../kubechain/kubechain";

export default class ConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    delete(kubechain: Kubechain) {
        try {
            new KubernetesConfigurationDeleter().delete(kubechain);
            new ChainConfigurationDeleter().delete(kubechain);
        }
        catch (e) {
            console.error("Unable to delete all fabric configuration.");
            console.error("Reason:", e);
        }
    }
}