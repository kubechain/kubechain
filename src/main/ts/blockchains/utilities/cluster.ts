import * as Inquirer from "inquirer";
import * as KubernetesClient from "kubernetes-client";

function getContexts(): string[] {
    const contexts: string[] = [];
    const kubeConfig = KubernetesClient.config.loadKubeconfig();
    kubeConfig.contexts.forEach((context: any) => {
        contexts.push(context.name);
    });
    return contexts;
}

async function promptUserForDesiredContext() {
    const answers: any = await Inquirer
        .prompt([
            {
                type: 'list',
                name: 'context',
                message: 'Which cluster context do you want to use?',
                choices: getContexts(),
            }
        ]);
    return Promise.resolve(answers["context"]);
}

export {promptUserForDesiredContext}