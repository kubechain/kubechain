import KubernetesConfigurationDeleter from "./kubernetes/configuration/delete";
import ICommandExecutor from "../utilities/icommandexecutor";
import ChainConfigurationDeleter from "./blockchain/configuration/delete";
import KubechainTargets from "../../targets";

export default class ConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    delete(targets: KubechainTargets) {
        try {
            new KubernetesConfigurationDeleter().delete(targets);
            new ChainConfigurationDeleter().delete(targets);
        }
        catch (e) {
            console.error("Unable to delete all fabric configuration.");
            console.error("Reason:", e);
        }
    }
}