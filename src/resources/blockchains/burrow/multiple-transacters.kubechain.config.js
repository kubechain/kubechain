const Path = require("path");

const Naming = require("./src/main/lib/kubernetes-sdk/utilities/naming");
const Container = require("./src/main/lib/kubernetes-sdk/api/1.8/workloads/container/container").default;
const ConfigMap = require("./src/main/lib/kubernetes-sdk/api/1.8/configuration-storage/configuration/configmap/configmap").default;
const Job = require("./src/main/lib/kubernetes-sdk/api/1.8/workloads/job/job").default;
const JobSpec = require("./src/main/lib/kubernetes-sdk/api/1.8/workloads/job/spec/spec").default;

const namespace = "burrow-minikube";

const resources = [];
let currentJob;
let currentSpec;
let currentConfigMap;
let transacterContainer;

module.exports = {
    targets: {
        blockchain: "burrow",
        kubernetes: "minikube"
    },
    adapter: {
        hooks: {
            createdRepresentations: function (data) {
            },
            workload: {
                beforeCreate: function (data) {
                    const validatorAddresses = [];
                    validatorAddresses.push(Naming.fullyQualifiedDomainName(data.name, data.service, data.namespace));
                    const configMapName = data.name + "-transacter-config";
                    const jobName = data.name + "-transacter-job";
                    currentConfigMap = new ConfigMap(configMapName, namespace);
                    currentConfigMap.addDataPair("configuration.json", JSON.stringify({
                            transactionsPerSecond: 3,
                            amountOfTransactions: 9,
                            validators: validatorAddresses,
                            payloads: [{"mine": "No really"}]
                        }
                    ));
                    const currentConfigMapVolume = currentConfigMap.toVolume();

                    transacterContainer = new Container("transacter", "robertdiebels/burrow-transacter:0.1.0");
                    transacterContainer.setImagePullPolicy("Always");
                    currentSpec = new JobSpec();
                    currentSpec.addContainer(transacterContainer);
                    currentSpec.addVolume(currentConfigMapVolume);

                    currentJob = new Job(jobName, namespace);
                    currentJob.setSpec(currentSpec);
                    transacterContainer.addVolumeMount(currentConfigMapVolume.toVolumeMount(Path.posix.join(Path.posix.sep, 'usr', 'src', 'app', 'configuration', 'transacter')));

                    resources.push({fileName: jobName, resource: currentJob});
                    resources.push({fileName: configMapName, resource: currentConfigMap})
                },
                createdConfiguration: function (configMap) {
                    const volume = configMap.toVolume();
                    currentSpec.addVolume(volume);
                    transacterContainer.addVolumeMount(volume.toVolumeMount(Path.posix.join(Path.posix.sep, 'usr', 'src', 'app', 'configuration', 'account')));
                },
                created: function () {
                }
            },
            beforeWrite: function (data) {
                resources.forEach((resource) => {
                        data.resources.push(resource);
                    }
                )
            }

        }
    }
};