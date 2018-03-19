import KubernetesConfigurationDeleter from "./kubernetes/configuration/delete";
import ICommandExecutor from "../utilities/icommandexecutor";

export default class FabricConfigurationDeleter implements ICommandExecutor {
    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    delete() {
        try {
            new KubernetesConfigurationDeleter().delete();
            //TODO: Implement target option
            // new ChainConfigurationDeleter().delete();
        }
        catch (e) {
            console.error("Unable to delete all fabric configuration.");
            console.error("Reason:", e);
        }
    }
}