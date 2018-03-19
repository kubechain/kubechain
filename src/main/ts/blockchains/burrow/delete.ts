import IntermediateConfigurationDeleter from "./blockchain/configuration/delete";
import KubernetesConfigurationDeleter from "./kubernetes/configuration/delete";
import ICommandExecutor from "../utilities/icommandexecutor";

export default class ConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'burrow';
    }

    delete() {
        new IntermediateConfigurationDeleter().delete();
        new KubernetesConfigurationDeleter().delete();
    }
}