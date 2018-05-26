# Hyperledger Fabric adapter options
As of version 0.5.0 of Kubechain the Hyperledger Fabric adapter allows you to pass it more complex options.

## Channels
Hyperledger Fabric has a concept known as Channels. Channels represent a private ledger between of peers spanning of organizations.
Kubechain creates channels for you using Fabric's binaries. Where before youw ould create the channel transactions manually Kubechain does this for you.

All you have to do is supply a ``name`` for the channel, a `profile` defined in your `configtx.yaml`  file and the `organizations`  Member Service Providers (MSPs) of organizations you want to be able to join the channel.

To use this option your `kubechain.config.js` file should contain the exports shown below.
```javascript
module.exports = {
    targets: {
        blockchain: "fabric",
        kubernetes: "minikube"
    },
    adapter: {
        options: {
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
```

## Chaincodes
In Hyperledger Fabric smart-contracts are known as Chaincode. They are used to perform actions on a ledger.
Kubechain allows you to add the source code of chaincodes to peers with an option aptly named ``chaincodes``.

For each chaincode you wish to add you only have to supply it's ``id`` and add the source code to the `./configuration/fabric/chaincodes/${id}` directory.  
So if your chaincode has the id ``chaincode_example02`` you should have a directory containing your source code at the path `./configuration/fabric/chaincodes/chaincode_example02`.

To use this option your `kubechain.config.js` file should contain the exports shown below.
````javascript
module.exports = {
    targets: {
        blockchain: "fabric",
        kubernetes: "minikube"
    },
    adapter: {
        options: {
            chaincodes: [{id: "chaincode_example02"}],
        }
    }
};
````