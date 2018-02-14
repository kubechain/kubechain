const KubernetesClient = require('kubernetes-client');

class KuberentesConfiguration {
    static getContexts() {
        const kubeConfig = KubernetesClient.config.loadKubeconfig();
        const contexts = kubeConfig.contexts || [];
        return contexts.map(context => {
            return context.name;
        });
    }

    static currentContext() {
        const kubeConfig = KubernetesClient.config.loadKubeconfig();
        return kubeConfig['current-context'].name || '';
    }
}

module.exports = {Config: KuberentesConfiguration};