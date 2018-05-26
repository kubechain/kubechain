# The Kubechain configuration file
Kubechain can be configured via the CLI or with a configuration file named ``kubechain.config.js``.
The CLI takes precedence over the configuration file. It doesn't add any additional configuration from the ``kubechain.config.js`` file if you're using the CLI.

## Simple configuration
Depending on the adapter you're using the configuration file in it's most simple form will look like the one below.

See: [docs/tutorials/fabric/configuration-samples/kubechain/simple.kubechain.config.js](docs/tutorials/fabric/configuration-samples/kubechain/simple.kubechain.config.js)

````javascript
module.exports = {
    targets: {
        blockchain: "fabric",
        kubernetes: "minikube"
    }
};
````

Here the value for ``blockchain`` property is the blockchain you wish to deploy.  
The value for `kubernetes` property is the kubernetes target.  
Both values together determine which adapter is used during configuration generation and cluster deployment.

## Adapter options
The Kubechain configuration file has an ``adapter`` property which enables passing options to adapters. These options differ per adapter so be sure to check out the options document for each adapter.

See: [docs/tutorials/fabric/configuration-samples/kubechain/chaincode-and-channel.kubechain.config.js](docs/tutorials/fabric/configuration-samples/kubechain/chaincode-and-channel.kubechain.config.js)
````javascript
module.exports = {
    targets: {
        blockchain: "fabric",
        kubernetes: "minikube"
    },
    adapter: {
        options: {
            chaincodes: [{id: "chaincode_example02"}],
            channels: [
                {
                    name: "kubechain",
                    profile: "TwoOrgsChannel",
                    organizations: ["Org1MSP", "Org2MSP"]
                }
            ]
        }
    }
};
````