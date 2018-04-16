import ChainConfigurationDeleter from "./blockchain/configuration/delete";
import KubernetesConfigurationDeleter from "./kubernetes/configuration/delete";
import ICommandExecutor from "../utilities/icommandexecutor";
import KubechainTargets from "../../targets";

export default class ConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'burrow';
    }

    delete(targets: KubechainTargets) {
        new ChainConfigurationDeleter().delete(targets);
        new KubernetesConfigurationDeleter().delete(targets);
    }
}